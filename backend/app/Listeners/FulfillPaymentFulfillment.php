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
            $orderStatus = $payable->status instanceof \BackedEnum ? $payable->status->value : (string) $payable->status;
            if ($orderStatus === 'cancelled') {
                Log::critical("ADMIN REVIEW REQUIRED: Payment {$payment->reference} received for already-cancelled Order #{$payable->order_number}");
                $flagNote = "[ADMIN REVIEW REQUIRED] Payment {$payment->reference} (GHS {$payment->amount}) received after order was cancelled on " . now()->toDateTimeString();
                $payable->update([
                    'admin_notes' => trim(($payable->admin_notes ? $payable->admin_notes . "\n" : '') . $flagNote),
                ]);
                return;
            }

            // Mark order as processing/paid immediately so customer sees Processing & tracking bar
            $this->orderService->updateStatus($payable, 'processing');
            $payable->update(['paid_at' => now()]);
            Log::info("Order #{$payable->order_number} marked as processing/paid via payment {$payment->reference}");

        } elseif ($payment->payable_type === HirePurchase::class) {
            // HP deposit confirmed — mark deposit_paid_at
            $payable->update(['deposit_paid_at' => now()]);
            Log::info("HP #{$payable->id} deposit confirmed via payment {$payment->reference}");
            
        } elseif ($payment->payable_type === \App\Models\HirePurchaseInstallment::class) {
            // HP installment confirmed — credit installment
            $installment = $payable;
            if ($installment->hirePurchase) {
                $this->hpService->payInstallment($installment->hirePurchase, $installment->id, $payment->reference);
                Log::info("HP Installment #{$installment->id} marked as paid via payment {$payment->reference}");
            }

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
                'payment_method' => $payment->method->value ?? 'mobile_money',
                'reference'      => $payment->reference,
                'notes'          => 'Direct MoMo deposit confirmed by admin',
                'color_code'     => $colorCode,
            ]);

            if (($currentBoxes + $boxesCovered) >= $payable->total_boxes) {
                $payable->update(['status' => 'completed']);
            }
            Log::info("LayawayCard #{$payable->id} payment confirmed for {$boxesCovered} boxes via payment {$payment->reference}");
        }
    }
}
