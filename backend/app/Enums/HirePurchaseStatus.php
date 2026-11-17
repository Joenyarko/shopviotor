<?php

namespace App\Enums;

enum HirePurchaseStatus: string
{
    case Pending   = 'pending';
    case Active    = 'active';
    case Defaulted = 'defaulted';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Pending Approval',
            self::Active    => 'Active',
            self::Defaulted => 'Defaulted',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }
}
