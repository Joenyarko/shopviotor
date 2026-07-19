<?php

namespace App\Listeners;

use App\Events\RaffleWinnerPicked;
use App\Notifications\RaffleWinnerNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyRaffleWinner implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(RaffleWinnerPicked $event): void
    {
        $winner = $event->raffle->winner;
        if ($winner) {
            $winner->user->notify(new RaffleWinnerNotification($event->raffle, $winner));
        }
    }
}
