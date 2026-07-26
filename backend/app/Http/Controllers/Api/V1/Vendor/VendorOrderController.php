<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorOrderController extends Controller
{
    private function getStore()
    {
        return auth()->user()->store;
    }

    /**
     * Get list of orders containing items from the vendor's store.
     */
    public function index(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $orders = Order::whereHas('items.product', function ($query) use ($store) {
            $query->where('store_id', $store->id);
        })->with([
            'user',
            'items' => function ($query) use ($store) {
                $query->whereHas('product', fn($q) => $q->where('store_id', $store->id))->with('product.images');
            },
            'payment',
            'address'
        ])->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /**
     * Get details of a specific order for the vendor.
     */
    public function show(string $uuid): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $order = Order::where('uuid', $uuid)
            ->whereHas('items.product', fn($q) => $q->where('store_id', $store->id))
            ->with([
                'user',
                'items' => fn($q) => $q->whereHas('product', fn($p) => $p->where('store_id', $store->id))->with('product.images'),
                'payment',
                'address'
            ])->firstOrFail();

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Update order status by vendor.
     */
    public function updateStatus(Request $request, string $uuid): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $order = Order::where('uuid', $uuid)
            ->whereHas('items.product', fn($q) => $q->where('store_id', $store->id))
            ->firstOrFail();

        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $order = app(OrderService::class)->updateStatus($order, $data['status'], $data['note'] ?? null);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'data'    => new OrderResource($order->load(['user', 'items' => fn($q) => $q->whereHas('product', fn($p) => $p->where('store_id', $store->id))->with('product.images'), 'payment', 'address'])),
        ]);
    }
}
