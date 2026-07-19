<?php

namespace App\Enums;

enum MessageStatus: string
{
    case Sent      = 'sent';
    case Delivered = 'delivered';
    case Read      = 'read';
    case Deleted   = 'deleted';

    public function label(): string
    {
        return match($this) {
            self::Sent      => 'Sent',
            self::Delivered => 'Delivered',
            self::Read      => 'Read',
            self::Deleted   => 'Deleted',
        };
    }
}
