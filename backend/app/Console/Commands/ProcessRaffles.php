<?php

namespace App\Console\Commands;

use App\Models\Raffle;
use App\Enums\RaffleStatus;
use App\Services\RaffleService;
use Illuminate\Console\Command;

class ProcessRaffles extends Command
{
    protected $signature = 'raffles:process';
    protected $description = 'Close ended raffles and draw winners automatically';

    public function handle(RaffleService $raffleService): int
    {
        $this->info('Processing raffles...');

        // 1. Close raffles that have passed their end date
        $expiredRaffles = Raffle::where('status', RaffleStatus::Active->value)
            ->where('ends_at', '<=', now())
            ->get();

        foreach ($expiredRaffles as $raffle) {
            $raffle->update(['status' => RaffleStatus::Closed->value]);
            $this->info("Closed raffle #{$raffle->id}");
        }

        // 2. Draw winners for closed raffles that haven't been drawn yet
        $closedRaffles = Raffle::where('status', RaffleStatus::Closed->value)
            ->whereNull('drawn_at')
            ->get();

        foreach ($closedRaffles as $raffle) {
            try {
                if ($raffle->tickets()->count() > 0) {
                    $raffleService->drawWinner($raffle);
                    $this->info("Winner drawn for raffle #{$raffle->id}");
                } else {
                    $raffle->update(['status' => RaffleStatus::Cancelled->value]);
                    $this->info("Raffle #{$raffle->id} cancelled due to 0 tickets sold.");
                }
            } catch (\Exception $e) {
                $this->error("Failed to draw winner for raffle #{$raffle->id}: " . $e->getMessage());
            }
        }

        $this->info('Raffle processing complete.');
        return self::SUCCESS;
    }
}
