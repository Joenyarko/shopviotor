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

        // ─── Idempotency: prevent duplicate orders ────────────────────────────
        $idempotencyKey = $request->header('X-Idempotency-Key');
        if ($idempotencyKey) {
            $cacheKey = "idempotency:checkout:{$user->id}:{$idempotencyKey}";
            $cached   = Cache::get($cacheKey);
            if ($cached) {
                return response()->json($cached, 200);
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
        ]);

        $responseBody = [
            'message' => 'Order placed successfully.',
            'order'   => new OrderResource($order),
            'payment' => $paymentData,
        ];

        // Cache idempotent response for 24 hours
        if ($idempotencyKey) {
            Cache::put($cacheKey, $responseBody, now()->addHours(24));
        }

        return response()->json($responseBody, 201);
    }
}
