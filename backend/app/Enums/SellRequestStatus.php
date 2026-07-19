<?php

namespace App\Enums;

enum SellRequestStatus: string
{
    case Pending       = 'pending';
    case UnderReview   = 'under_review';
    case Approved      = 'approved';
    case Rejected      = 'rejected';
    case CounterOffer  = 'counter_offer';
    case PickupScheduled = 'pickup_scheduled';
    case Inspecting    = 'inspecting';
    case Completed     = 'completed';
    case Cancelled     = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending          => 'Pending',
            self::UnderReview      => 'Under Review',
            self::Approved         => 'Approved',
            self::Rejected         => 'Rejected',
            self::CounterOffer     => 'Counter Offer',
            self::PickupScheduled  => 'Pickup Scheduled',
            self::Inspecting       => 'Inspecting',
            self::Completed        => 'Completed',
            self::Cancelled        => 'Cancelled',
        };
    }
}
