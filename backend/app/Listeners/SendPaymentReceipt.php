<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Models\Order;
use App\Models\HirePurchase;
use App\Notifications\PaymentReceiptNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendPaymentReceipt implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment;
        $user    = $payment->user;

        // Update related model status when payment confirmed
        if ($payment->payable_type === Order::class) {
            $payment->payable()->update(['status' => 'confirmed', 'paid_at' => now()]);
        } elseif ($payment->payable_type === HirePurchase::class) {
            $payment->payable()->update(['deposit_paid_at' => now()]);
        }

        $user->notify(new PaymentReceiptNotification($payment));
    }
}
