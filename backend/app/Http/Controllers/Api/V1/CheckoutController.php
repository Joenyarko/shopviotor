<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct(
        private OrderService   $orderService,
        private PaymentService $paymentService
    ) {}

    public function process(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $idempotencyKey = $request->header('X-Idempotency-Key');

        $executeCheckout = function () use ($user, $data, $idempotencyKey): JsonResponse {
            $cacheKey = $idempotencyKey ? "idempotency:checkout:{$user->id}:{$idempotencyKey}" : null;
            if ($cacheKey) {
                $cached = Cache::get($cacheKey);
                if ($cached) {
                    return response()->json($cached, 200);
                }
            }

            // ─── Paystack Subaccount Split / Compliance Guard ─────────────────────
            // Vendor products may only use Paystack if the vendor has a linked Paystack Subaccount
            // (and the cart is not mixed across different sellers), so Shop Viotor never holds vendor funds.
            $paystackSubaccount = null;
            if (($data['payment_method'] ?? '') === 'paystack') {
                $rawIds = collect($data['items'])->pluck('product_id')->all();
                $uuids  = array_values(array_filter($rawIds, fn ($id) => is_string($id) && Str::isUuid($id)));
                $numIds = array_values(array_filter($rawIds, fn ($id) => ctype_digit((string) $id)));

                $products = collect();
                if (!empty($uuids)) {
                    $products = $products->merge(\App\Models\Product::with('store')->whereIn('uuid', $uuids)->get());
                }
                if (!empty($numIds)) {
                    $products = $products->merge(\App\Models\Product::with('store')->whereIn('id', $numIds)->get());
                }
                $products = $products->unique('id')->values();

                $hasShopViotorItem = $products->contains(fn ($p) => is_null($p->store_id));
                $vendorStores = $products->pluck('store')->filter()->unique('id')->values();

                if ($vendorStores->isNotEmpty()) {
                    if ($hasShopViotorItem || $vendorStores->count() > 1) {
                        return response()->json([
                            'message' => 'Please checkout items from one vendor at a time for Paystack, or use Direct Mobile Money.',
                        ], 422);
                    }

                    $vendorStore = $vendorStores->first();
                    if (empty($vendorStore->paystack_subaccount_code)) {
                        return response()->json([
                            'message' => "{$vendorStore->name} accepts Direct Mobile Money only. Please select Direct Mobile Money to pay the vendor directly.",
                        ], 422);
                    }

                    $paystackSubaccount = $vendorStore->paystack_subaccount_code;
                }
            }

            $order = $this->orderService->placeOrder($user->id, $data);

            $paymentData = $this->paymentService->initiate([
                'payable_type' => Order::class,
                'payable_id'   => $order->id,
                'user_id'      => $user->id,
                'email'        => $user->email,
                'amount'       => $order->total,
                'method'       => $data['payment_method'],
                'phone'        => $data['payment_phone'] ?? null,
                'provider'     => $data['payment_provider'] ?? null,
                'subaccount'   => $paystackSubaccount,
            ]);

            $responseBody = [
                'message' => 'Order placed successfully.',
                'order'   => new OrderResource($order),
                'payment' => $paymentData,
            ];

            // Cache idempotent response for 24 hours
            if ($cacheKey) {
                Cache::put($cacheKey, $responseBody, now()->addHours(24));
            }

            return response()->json($responseBody, 201);
        };

        // ─── Idempotency Lock: serialize concurrent requests with the same key ─
        if ($idempotencyKey) {
            return Cache::lock("lock:checkout:{$user->id}:{$idempotencyKey}", 30)
                ->block(10, $executeCheckout);
        }

        return $executeCheckout();
    }
}
