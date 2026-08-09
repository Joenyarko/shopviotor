<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Mail\PaymentReceiptMail;
use App\Models\HirePurchase;
use App\Models\Order;
use App\Services\HirePurchaseService;
use App\Services\OrderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPaymentReceipt implements ShouldQueue
{
    public string $queue = 'notifications';

    public function __construct(
        private HirePurchaseService $hpService,
        private OrderService $orderService
    ) {}

    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment->load(['user', 'payable']);
        $user    = $payment->user;



        // ─── Send payment receipt email ────────────────────────────────────────
        if ($user && $user->email) {
            try {
                Mail::to($user->email)->send(new PaymentReceiptMail($payment));
                Log::info("Payment receipt sent to {$user->email} for ref {$payment->reference}");
            } catch (\Exception $e) {
                Log::error("Failed to send payment receipt for {$payment->reference}: " . $e->getMessage());
            }
        }
    }
}
