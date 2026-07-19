<?php

namespace App\Console\Commands;

use App\Models\HirePurchaseInstallment;
use App\Models\HirePurchase;
use App\Enums\HirePurchaseStatus;
use Illuminate\Console\Command;

class CheckOverdueInstallments extends Command
{
    protected $signature = 'hp:check-overdue';
    protected $description = 'Check and mark hire purchase installments as overdue, applying late fees';

    public function handle(): int
    {
        $this->info('Checking overdue installments...');

        $overdueInstallments = HirePurchaseInstallment::where('status', 'pending')
            ->where('due_date', '<', now()->startOfDay())
            ->get();

        foreach ($overdueInstallments as $installment) {
            $hp = $installment->hirePurchase;
            
            // Only apply if late fee hasn't been applied or status changed
            if ($installment->status === 'pending') {
                $installment->update([
                    'status'   => 'overdue',
                    'late_fee' => $hp->late_fee,
                ]);

                // If it's more than 30 days overdue, mark the HP agreement as defaulted
                if ($installment->due_date->copy()->addDays(30)->isPast() && $hp->status->value !== 'defaulted') {
                    $hp->update([
                        'status'       => HirePurchaseStatus::Defaulted->value,
                        'defaulted_at' => now(),
                    ]);
                    $this->warn("HP Agreement #{$hp->id} marked as defaulted.");
                }

                $this->info("Installment #{$installment->id} marked as overdue.");
            }
        }

        $this->info('Overdue installment check complete.');
        return self::SUCCESS;
    }
}
