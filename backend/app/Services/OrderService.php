<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private OrderRepository $orderRepo,
        private ProductService  $productService,
    ) {}

    public function placeOrder(int $userId, array $data): Order
    {
        return DB::transaction(function () use ($userId, $data) {
            $items    = $this->validateAndPriceItems($data['items']);
            $coupon   = isset($data['coupon_code']) ? $this->applyCoupon($data['coupon_code'], $userId) : null;
            $subtotal = collect($items)->sum('total');

            $discount = 0;
            if ($coupon) {
                $discount = $coupon->calculateDiscount($subtotal);
                $coupon->increment('usage_count');
            }

            $shipping = collect($items)->sum('shipping');
            $taxRate  = (float) \App\Models\Setting::getValue('tax_rate', 0) / 100;
            $tax      = ($subtotal - $discount) * $taxRate;
            $total    = $subtotal - $discount + $shipping + $tax;

            $order = $this->orderRepo->create([
                'user_id'         => $userId,
                'address_id'      => $data['address_id'] ?? null,
                'coupon_id'       => $coupon?->id,
                'status'          => \App\Enums\OrderStatus::Pending,
                'subtotal'        => $subtotal,
                'discount_amount' => $discount,
                'shipping_amount' => $shipping,
                'tax_amount'      => $tax,
                'total'           => $total,
                'currency'        => 'GHS',
                'notes'           => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $order->items()->create($item);
                // Decrement stock (already locked via lockForUpdate in validateAndPriceItems)
                Product::where('id', $item['product_id'])->decrement('stock_quantity', $item['quantity']);
            }

            event(new OrderPlaced($order));

            return $order->load('items.product');
        });
    }

    private function validateAndPriceItems(array $items): array
    {
        return collect($items)->map(function ($item) {
            $rawId = $item['product_id'];
            $query = Product::active()->inStock();

            if (is_string($rawId) && \Illuminate\Support\Str::isUuid($rawId)) {
                $query->where('uuid', $rawId);
            } elseif (ctype_digit((string) $rawId)) {
                $query->where('id', (int) $rawId);
            } else {
                throw ValidationException::withMessages([
                    "items.{$rawId}" => ['Invalid product identifier.'],
                ]);
            }

            // lockForUpdate prevents race conditions on concurrent checkouts
            $product = $query->lockForUpdate()->first();

            if (!$product) {
                throw ValidationException::withMessages([
                    "items.{$item['product_id']}" => ["Product not found or unavailable."],
                ]);
            }

            if ($product->stock_quantity < $item['quantity']) {
                throw ValidationException::withMessages([
                    "items.{$item['product_id']}" => ["Insufficient stock for {$product->name}."],
                ]);
            }

            $shippingFee = 0;
            if ($product->shipping_type === 'custom') {
                $shippingFee = $product->custom_shipping_fee * $item['quantity'];
            } elseif ($product->shipping_type === 'default') {
                $defaultFee = (float) \App\Models\Setting::getValue('default_shipping_fee', 0);
                $shippingFee = $defaultFee * $item['quantity'];
            }

            return [
                'product_id'       => $product->id,
                'product_name'     => $product->name,
                'product_sku'      => $product->sku,
                'price'            => $product->price,
                'quantity'         => $item['quantity'],
                'total'            => $product->price * $item['quantity'],
                'shipping'         => $shippingFee,
                'product_snapshot' => $product->only(['id', 'name', 'price', 'sku', 'condition', 'shipping_type']),
            ];
        })->toArray();
    }

    private function applyCoupon(string $code, int $userId): Coupon
    {
        $coupon = Coupon::where('code', $code)
            ->valid()
            ->lockForUpdate() // SECURITY: Prevent concurrent coupon redemption race condition
            ->first();

        if (!$coupon) {
            throw ValidationException::withMessages([
                'coupon_code' => ['This coupon code is invalid or expired.'],
            ]);
        }

        // Enforce per-user limit
        if ($coupon->per_user_limit) {
            $userUsageCount = Order::where('user_id', $userId)
                ->where('coupon_id', $coupon->id)
                ->count();

            if ($userUsageCount >= $coupon->per_user_limit) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['You have already used this coupon the maximum number of times.'],
                ]);
            }
        }

        return $coupon;
    }

    public function updateStatus(Order $order, string $status, ?string $note = null): Order
    {
        $oldStatus = $order->status->value ?? $order->status;
        $updates = ['status' => $status];

        match($status) {
            'delivered' => $updates['delivered_at'] = now(),
            'shipped'   => $updates['shipped_at'] = now(),
            'cancelled' => array_merge($updates, [
                'cancelled_at'        => now(),
                'cancellation_reason' => $note,
            ]),
            default => null,
        };

        if ($note && $status === 'cancelled') {
            $updates['cancellation_reason'] = $note;
            $updates['cancelled_at'] = now();
        }

        $order->update($updates);

        // Handle Inventory and Coupons upon cancellation (vendor wallets disabled)
        if ($oldStatus !== 'cancelled' && $status === 'cancelled') {
            // Restore inventory to products
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock_quantity', $item->quantity);
            }

            // Roll back coupon usage count if applied
            if ($order->coupon_id) {
                Coupon::where('id', $order->coupon_id)->where('usage_count', '>', 0)->decrement('usage_count');
            }
        }

        // Notify customer by email on meaningful status transitions (non-fatal)
        if ($oldStatus !== $status && in_array($status, ['processing', 'shipped', 'delivered', 'cancelled'], true)) {
            $this->sendStatusUpdateEmail($order, $status, $note);
        }

        return $order->fresh();
    }

    private function sendStatusUpdateEmail(Order $order, string $status, ?string $note = null): void
    {
        try {
            $order->loadMissing('user');
            if ($order->user && $order->user->email) {
                \Illuminate\Support\Facades\Mail::to($order->user->email)
                    ->send(new \App\Mail\OrderStatusUpdatedMail($order, $status, $note));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Order status email skipped: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
                'status'       => $status,
            ]);
        }
    }

    public function confirmManualPayment(Order $order, string $method = 'momo', ?string $transactionId = null, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($order, $method, $transactionId, $notes) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            // Idempotency guard: if already paid, return without modifying anything
            if (!is_null($lockedOrder->paid_at)) {
                return $lockedOrder->fresh(['payment', 'items.product', 'user', 'address']);
            }

            $formattedNote = trim(($lockedOrder->admin_notes ? $lockedOrder->admin_notes . "\n" : "") . ($notes ?? "Payment confirmed by admin via MoMo"));

            $lockedOrder->update([
                'status'      => \App\Enums\OrderStatus::Processing,
                'paid_at'     => now(),
                'admin_notes' => $formattedNote,
            ]);

            // Create or update associated Payment record
            $payment = $lockedOrder->payment;
            if ($payment) {
                $payment->update([
                    'status'            => \App\Enums\PaymentStatus::Completed,
                    'method'            => \App\Enums\PaymentMethod::MobileMoney,
                    'gateway_reference' => $transactionId,
                    'notes'             => $notes,
                    'paid_at'           => now(),
                ]);
            } else {
                $lockedOrder->payment()->create([
                    'user_id'           => $lockedOrder->user_id,
                    'amount'            => $lockedOrder->total,
                    'currency'          => $lockedOrder->currency ?? 'GHS',
                    'method'            => \App\Enums\PaymentMethod::MobileMoney,
                    'status'            => \App\Enums\PaymentStatus::Completed,
                    'reference'         => $lockedOrder->order_number,
                    'gateway_reference' => $transactionId,
                    'notes'             => $notes,
                    'paid_at'           => now(),
                ]);
            }

            $result = $lockedOrder->fresh(['payment', 'items.product', 'user', 'address']);
            $this->sendStatusUpdateEmail($result, 'processing', 'Your payment has been confirmed and your order is now being processed.');

            return $result;
        });
    }

    public function cancelOrder(Order $order, int $userId, ?string $reason = null): Order
    {
        if ($order->user_id !== $userId) {
            throw new \Exception('Unauthorized to cancel this order.');
        }

        if ($order->status->isFinal()) {
            throw ValidationException::withMessages([
                'order' => ['This order cannot be cancelled.'],
            ]);
        }

        return $this->updateStatus($order, 'cancelled', $reason);
    }
}
