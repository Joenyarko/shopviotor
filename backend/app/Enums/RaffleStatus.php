<?php

namespace App\Enums;

enum RaffleStatus: string
{
    case Draft     = 'draft';
    case Active    = 'active';
    case Closed    = 'closed';
    case Drawn     = 'drawn';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Draft     => 'Draft',
            self::Active    => 'Active',
            self::Closed    => 'Closed',
            self::Drawn     => 'Drawn',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function allowsTicketPurchase(): bool
    {
        return $this === self::Active;
    }
}
