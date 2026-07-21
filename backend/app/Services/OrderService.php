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
            $coupon   = isset($data['coupon_code']) ? $this->applyCoupon($data['coupon_code']) : null;
            $subtotal = collect($items)->sum('total');

            $discount = 0;
            if ($coupon) {
                $discount = $coupon->calculateDiscount($subtotal);
                $coupon->increment('usage_count');
            }

            $shipping = $data['shipping_amount'] ?? 0;
            $tax      = $data['tax_amount'] ?? 0;
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
                // Decrement stock
                Product::where('id', $item['product_id'])->decrement('stock_quantity', $item['quantity']);
            }

            event(new OrderPlaced($order));

            return $order->load('items.product');
        });
    }

    private function validateAndPriceItems(array $items): array
    {
        return collect($items)->map(function ($item) {
            $product = Product::active()->inStock()->where('uuid', $item['product_id'])->firstOrFail();

            if ($product->stock_quantity < $item['quantity']) {
                throw ValidationException::withMessages([
                    "items.{$item['product_id']}" => ["Insufficient stock for {$product->name}."],
                ]);
            }

            return [
                'product_id'       => $product->id,
                'product_name'     => $product->name,
                'product_sku'      => $product->sku,
                'price'            => $product->price,
                'quantity'         => $item['quantity'],
                'total'            => $product->price * $item['quantity'],
                'product_snapshot' => $product->only(['id', 'name', 'price', 'sku', 'condition']),
            ];
        })->toArray();
    }

    private function applyCoupon(string $code): Coupon
    {
        $coupon = Coupon::where('code', $code)->valid()->first();

        if (!$coupon) {
            throw ValidationException::withMessages([
                'coupon_code' => ['This coupon code is invalid or expired.'],
            ]);
        }

        return $coupon;
    }

    public function updateStatus(Order $order, string $status, ?string $note = null): Order
    {
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
        return $order->fresh();
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
