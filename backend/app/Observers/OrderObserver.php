<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class OrderObserver
{
    public function created(Order $order): void
    {
        ActivityLog::create([
            'user_id'      => Auth::id(),
            'action'       => 'order_created',
            'subject_type' => Order::class,
            'subject_id'   => $order->id,
            'description'  => "Order #{$order->order_number} created",
            'ip_address'   => Request::ip(),
        ]);
    }

    public function updated(Order $order): void
    {
        if ($order->wasChanged('status')) {
            ActivityLog::create([
                'user_id'      => Auth::id(),
                'action'       => 'order_status_changed',
                'subject_type' => Order::class,
                'subject_id'   => $order->id,
                'description'  => "Order #{$order->order_number} status changed",
                'old_values'   => ['status' => $order->getOriginal('status')],
                'new_values'   => ['status' => $order->status->value],
                'ip_address'   => Request::ip(),
            ]);
        }
    }
}
