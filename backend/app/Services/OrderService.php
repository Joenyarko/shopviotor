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
            // lockForUpdate prevents race conditions on concurrent checkouts
            $product = Product::active()
                ->inStock()
                ->where(function ($q) use ($item) {
                    $q->where('uuid', $item['product_id'])
                      ->orWhere('id', $item['product_id']);
                })
                ->lockForUpdate()
                ->first();

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

        // Handle Vendor Commissions
        if ($oldStatus !== 'confirmed' && $status === 'confirmed') {
            $this->createPendingCommissions($order);
        } elseif ($oldStatus !== 'delivered' && $status === 'delivered') {
            $this->completeCommissions($order);
        } elseif ($status === 'cancelled' && in_array($oldStatus, ['pending', 'confirmed', 'processing', 'shipped'])) {
            $this->cancelCommissions($order);
        }

        return $order->fresh();
    }

    private function createPendingCommissions(Order $order): void
    {
        $items = $order->items()->with('product.store.wallet')->get();

        foreach ($items as $item) {
            $store = $item->product?->store;
            if (!$store) continue;

            $commissionRate = $store->commission_rate ?? 0;
            $adminCut = ($item->total * $commissionRate) / 100;
            $vendorCut = $item->total - $adminCut;

            $wallet = $store->wallet()->firstOrCreate(
                ['store_id' => $store->id],
                ['available_balance' => 0, 'pending_balance' => 0, 'total_earned' => 0]
            );

            // Add to pending balance
            $wallet->increment('pending_balance', $vendorCut);

            // Create pending transaction
            $store->transactions()->create([
                'type' => 'credit',
                'amount' => $vendorCut,
                'commission_amount' => $adminCut,
                'description' => "Sale of {$item->product_name} (x{$item->quantity}) from Order {$order->order_number}",
                'status' => 'pending',
                'reference_type' => Order::class,
                'reference_id' => $order->id,
            ]);
        }
    }

    private function completeCommissions(Order $order): void
    {
        $transactions = \App\Models\StoreTransaction::where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->where('status', 'pending')
            ->get();

        foreach ($transactions as $txn) {
            $wallet = $txn->store->wallet;
            if (!$wallet) continue;
            
            DB::transaction(function() use ($wallet, $txn) {
                $wallet->decrement('pending_balance', $txn->amount);
                $wallet->increment('available_balance', $txn->amount);
                $wallet->increment('total_earned', $txn->amount);
                $txn->update(['status' => 'completed']);
            });
        }
    }

    private function cancelCommissions(Order $order): void
    {
        $transactions = \App\Models\StoreTransaction::where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->where('status', 'pending')
            ->get();

        foreach ($transactions as $txn) {
            $wallet = $txn->store->wallet;
            if (!$wallet) continue;

            DB::transaction(function() use ($wallet, $txn) {
                $wallet->decrement('pending_balance', $txn->amount);
                $txn->update(['status' => 'cancelled']);
            });
        }
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
