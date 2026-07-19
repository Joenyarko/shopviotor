<?php

namespace App\Events;

use App\Models\SellRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SellRequestApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly SellRequest $sellRequest) {}
}
