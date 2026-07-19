<?php

namespace App\Enums;

enum HirePurchaseStatus: string
{
    case Active    = 'active';
    case Defaulted = 'defaulted';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Active    => 'Active',
            self::Defaulted => 'Defaulted',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }
}
