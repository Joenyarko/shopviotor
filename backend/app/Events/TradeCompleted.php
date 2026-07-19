<?php

namespace App\Events;

use App\Models\TradeRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TradeCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly TradeRequest $tradeRequest) {}
}
