<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Models\HirePurchase;
use App\Models\Order;
use App\Services\HirePurchaseService;
use App\Services\OrderService;
use Illuminate\Support\Facades\Log;

class FulfillPaymentFulfillment
{
    public function __construct(
        private HirePurchaseService $hpService,
        private OrderService $orderService
    ) {}

    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment->load(['user', 'payable']);
        $user    = $payment->user;

        // ─── Update related model status ───────────────────────────────────────
        $payable = $payment->payable;

        if (!$payable) {
            Log::warning("PaymentReceived: payable not found for payment #{$payment->id}");
            return;
        }

        if ($payment->payable_type === Order::class) {
            // Mark order as confirmed/paid via OrderService to trigger commission splits
            $this->orderService->updateStatus($payable, 'confirmed');
            $payable->update(['paid_at' => now()]);
            Log::info("Order #{$payable->order_number} marked as confirmed via payment {$payment->reference}");

        } elseif ($payment->payable_type === HirePurchase::class) {
            // HP deposit confirmed — mark deposit_paid_at
            $payable->update(['deposit_paid_at' => now()]);
            Log::info("HP #{$payable->id} deposit confirmed via payment {$payment->reference}");
            
        } elseif ($payment->payable_type === \App\Models\PreOrder::class) {
            // PreOrder deposit confirmed
            $payable->update([
                'deposit_paid' => $payable->deposit_paid + $payment->amount,
                'balance_remaining' => max(0, $payable->balance_remaining - $payment->amount),
                'status' => 'confirmed'
            ]);
            Log::info("PreOrder #{$payable->id} deposit confirmed via payment {$payment->reference}");
            
        } elseif ($payment->payable_type === \App\Models\LayawayCard::class) {
            $boxPrice = (float) $payable->box_price;
            $boxesCovered = (int) round($payment->amount / $boxPrice);
            $currentBoxes = $payable->payments()->sum('boxes_covered');
            
            $paymentCount = $payable->payments()->count();
            $colorCode    = ($paymentCount % 2 === 0) ? '#eab308' : '#000000';

            $payable->payments()->create([
                'uuid'           => \Illuminate\Support\Str::uuid()->toString(),
                'amount'         => $payment->amount,
                'boxes_covered'  => $boxesCovered,
                'payment_method' => $payment->method->value ?? 'Paystack',
                'reference'      => $payment->reference,
                'notes'          => 'Online payment via PaymentService',
                'color_code'     => $colorCode,
            ]);

            if (($currentBoxes + $boxesCovered) >= $payable->total_boxes) {
                $payable->update(['status' => 'completed']);
            }
            Log::info("LayawayCard #{$payable->id} payment confirmed for {$boxesCovered} boxes via payment {$payment->reference}");
            
        } elseif ($payment->payable_type === \App\Models\Raffle::class) {
            $quantity = (int) round($payment->amount / $payable->ticket_price);
            $raffleService = app(\App\Services\RaffleService::class);
            for ($i = 0; $i < $quantity; $i++) {
                $raffleService->purchaseTicket($user->id, $payable, $payment->reference . '-' . $i);
            }
            Log::info("Raffle #{$payable->id} purchased {$quantity} tickets via payment {$payment->reference}");
        }
    }
}
