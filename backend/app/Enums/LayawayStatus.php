<?php

namespace App\Enums;

enum LayawayStatus: string
{
    case Active    = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Defaulted = 'defaulted';

    public function label(): string
    {
        return match($this) {
            self::Active    => 'Active',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Defaulted => 'Defaulted',
        };
    }
}
