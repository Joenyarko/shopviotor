<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Draft     = 'draft';
    case Active    = 'active';
    case Inactive  = 'inactive';
    case Sold      = 'sold';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match($this) {
            self::Draft     => 'Draft',
            self::Active    => 'Active',
            self::Inactive  => 'Inactive',
            self::Sold      => 'Sold',
            self::Suspended => 'Suspended',
        };
    }

    public function isPubliclyVisible(): bool
    {
        return $this === self::Active;
    }
}
