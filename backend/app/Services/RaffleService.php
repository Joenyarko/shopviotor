<?php

namespace App\Services;

use App\Events\RaffleWinnerPicked;
use App\Models\Raffle;
use App\Models\RaffleTicket;
use App\Enums\RaffleStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RaffleService
{
    public function purchaseTicket(int $userId, Raffle $raffle, string $paymentReference): RaffleTicket
    {
        return DB::transaction(function () use ($userId, $raffle, $paymentReference) {
            // Lock the raffle row to prevent concurrent purchases from overselling
            $lockedRaffle = Raffle::where('id', $raffle->id)->lockForUpdate()->firstOrFail();

            if ($lockedRaffle->status !== RaffleStatus::Active) {
                throw ValidationException::withMessages(['raffle' => ['This raffle is not active.']]);
            }

            if (!$lockedRaffle->hasAvailableTickets()) {
                throw ValidationException::withMessages(['raffle' => ['All tickets have been sold.']]);
            }

            $ticketNumber = $this->generateTicketNumber($lockedRaffle);

            $ticket = RaffleTicket::create([
                'raffle_id'         => $lockedRaffle->id,
                'user_id'           => $userId,
                'ticket_number'     => $ticketNumber,
                'amount_paid'       => $lockedRaffle->ticket_price,
                'payment_reference' => $paymentReference,
            ]);

            $lockedRaffle->increment('tickets_sold');

            // Auto-close if max tickets reached
            if ($lockedRaffle->max_tickets && ($lockedRaffle->tickets_sold + 1) >= $lockedRaffle->max_tickets) {
                $lockedRaffle->update(['status' => RaffleStatus::Closed->value]);
            }

            return $ticket;
        });
    }

    public function drawWinner(Raffle $raffle): Raffle
    {
        if (!in_array($raffle->status, [RaffleStatus::Active, RaffleStatus::Closed])) {
            throw ValidationException::withMessages(['raffle' => ['Cannot draw a winner for this raffle.']]);
        }

        return DB::transaction(function () use ($raffle) {
            $winningTicket = $raffle->tickets()->inRandomOrder()->first();

            if (!$winningTicket) {
                throw ValidationException::withMessages(['raffle' => ['No tickets found for this raffle.']]);
            }

            $winningTicket->update(['is_winner' => true]);

            $raffle->winner()->create([
                'raffle_ticket_id'  => $winningTicket->id,
                'user_id'           => $winningTicket->user_id,
                'verification_code' => strtoupper(Str::random(8)),
            ]);

            $raffle->update([
                'status'   => RaffleStatus::Drawn->value,
                'drawn_at' => now(),
            ]);

            event(new RaffleWinnerPicked($raffle));

            return $raffle->fresh(['winner.user', 'winner.ticket']);
        });
    }

    public function verifyWinner(Raffle $raffle, string $code): bool
    {
        $winner = $raffle->winner;

        if (!$winner || $winner->verification_code !== $code) {
            return false;
        }

        $winner->update(['is_verified' => true, 'verified_at' => now()]);
        return true;
    }

    public function collectPrize(Raffle $raffle): Raffle
    {
        $raffle->winner()->update([
            'prize_collected'    => true,
            'prize_collected_at' => now(),
        ]);

        $raffle->update(['status' => RaffleStatus::Completed->value]);

        return $raffle->fresh();
    }

    private function generateTicketNumber(Raffle $raffle): string
    {
        $prefix = 'T' . str_pad($raffle->id, 4, '0', STR_PAD_LEFT);
        $seq = $raffle->tickets_sold + 1;
        do {
            $number = str_pad($seq++, 6, '0', STR_PAD_LEFT);
            $ticketNumber = "{$prefix}-{$number}";
        } while (RaffleTicket::where('raffle_id', $raffle->id)->where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }
}
