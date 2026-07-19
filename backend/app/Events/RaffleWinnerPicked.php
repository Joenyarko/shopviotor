<?php

namespace App\Events;

use App\Models\Raffle;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RaffleWinnerPicked
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Raffle $raffle) {}
}
