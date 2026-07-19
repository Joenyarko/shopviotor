<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderRepository $orderRepo,
        private OrderService    $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderRepo->getUserOrders(
            $request->user()->id,
            $request->input('per_page', 15)
        );

        return response()->json([
            'data' => OrderResource::collection($orders)->response()->getData(true),
        ]);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $order = $this->orderRepo->findByUuid($uuid, ['items.product', 'payment', 'address']);

        if ($request->user()->cannot('view', $order)) {
            abort(403);
        }

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $order = $this->orderRepo->findByUuid($uuid);

        if ($request->user()->cannot('cancel', $order)) {
            abort(403, 'Unauthorized or order cannot be cancelled.');
        }

        $order = $this->orderService->cancelOrder($order, $request->user()->id, $request->input('reason'));

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'data'    => new OrderResource($order),
        ]);
    }
}
