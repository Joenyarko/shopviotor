<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Completed  = 'completed';
    case Failed     = 'failed';
    case Refunded   = 'refunded';
    case Cancelled  = 'cancelled';
    case PartiallyPaid = 'partially_paid';

    public function label(): string
    {
        return match($this) {
            self::Pending       => 'Pending',
            self::Processing    => 'Processing',
            self::Completed     => 'Completed',
            self::Failed        => 'Failed',
            self::Refunded      => 'Refunded',
            self::Cancelled     => 'Cancelled',
            self::PartiallyPaid => 'Partially Paid',
        };
    }

    public function isSuccessful(): bool
    {
        return $this === self::Completed;
    }
}
