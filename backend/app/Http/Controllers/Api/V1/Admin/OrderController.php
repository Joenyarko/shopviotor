<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
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
        $perPage = (int) $request->input('per_page', 50);
        $orders = $this->orderRepo->paginate(
            $perPage,
            ['user.addresses', 'payment', 'address', 'items.product.images']
        );

        return response()->json([
            'data' => OrderResource::collection($orders)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = $this->orderRepo->findByUuid($uuid, ['user.addresses', 'items.product.images', 'payment', 'address']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function updateStatus(Request $request, string $uuid): JsonResponse
    {
        $order = $this->orderRepo->findByUuid($uuid);

        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $order = $this->orderService->updateStatus($order, $data['status'], $data['note'] ?? null);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'data'    => new OrderResource($order),
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = $this->orderRepo->getRevenueStats();

        return response()->json(['data' => $stats]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $order = \App\Models\Order::where('uuid', $uuid)->firstOrFail();
        $order->delete();
        
        return response()->json(['message' => 'Order deleted successfully.']);
    }

    public function restore(string $uuid): JsonResponse
    {
        $order = \App\Models\Order::withTrashed()->where('uuid', $uuid)->firstOrFail();
        $order->restore();
        
        return response()->json(['message' => 'Order restored successfully.']);
    }
}
