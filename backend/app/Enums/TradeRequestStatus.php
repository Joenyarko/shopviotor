<?php

namespace App\Enums;

enum TradeRequestStatus: string
{
    case Pending    = 'pending';
    case Valued     = 'valued';
    case Accepted   = 'accepted';
    case Rejected   = 'rejected';
    case PaymentRequired = 'payment_required';
    case Completed  = 'completed';
    case Cancelled  = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending          => 'Pending',
            self::Valued           => 'Valued',
            self::Accepted         => 'Accepted',
            self::Rejected         => 'Rejected',
            self::PaymentRequired  => 'Payment Required',
            self::Completed        => 'Completed',
            self::Cancelled        => 'Cancelled',
        };
    }
}
