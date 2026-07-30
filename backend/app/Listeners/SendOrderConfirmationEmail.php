<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderConfirmedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(OrderPlaced $event): void
    {
        $order = $event->order->load(['user', 'items']);

        if (!$order->user || !$order->user->email) {
            Log::warning("Order #{$order->order_number}: no user email, skipping confirmation.");
            return;
        }

        try {
            Mail::to($order->user->email)->send(new OrderConfirmedMail($order));
            Log::info("Order confirmation sent to {$order->user->email} for order {$order->order_number}");
        } catch (\Exception $e) {
            Log::error("Failed to send order confirmation for {$order->order_number}: " . $e->getMessage());
        }
    }
}
