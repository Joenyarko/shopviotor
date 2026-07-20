<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;

class VendorDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user  = auth()->user();
        $store = $user->store;

        if (!$store) {
            return response()->json(['message' => 'You do not have a store.'], 404);
        }

        $productIds = Product::where('store_id', $store->id)->pluck('id');

        $totalProducts = $productIds->count();
        $activeProducts = Product::where('store_id', $store->id)->where('status', 'active')->count();

        $orderItems = OrderItem::whereIn('product_id', $productIds)
            ->with('order')
            ->get();

        $totalOrders  = $orderItems->pluck('order_id')->unique()->count();
        $totalRevenue = $orderItems->sum(fn($item) => $item->price * $item->quantity);

        $recentOrders = $orderItems
            ->sortByDesc(fn($item) => $item->created_at)
            ->take(5)
            ->map(fn($item) => [
                'order_uuid'  => $item->order?->uuid,
                'product'     => $item->product?->name,
                'quantity'    => $item->quantity,
                'total'       => (float) ($item->price * $item->quantity),
                'status'      => $item->order?->status,
                'created_at'  => $item->created_at->toISOString(),
            ])->values();

        return response()->json([
            'data' => [
                'store'           => [
                    'name'   => $store->name,
                    'slug'   => $store->slug,
                    'status' => $store->status,
                ],
                'stats'           => [
                    'total_products'  => $totalProducts,
                    'active_products' => $activeProducts,
                    'total_orders'    => $totalOrders,
                    'total_revenue'   => round($totalRevenue, 2),
                ],
                'recent_orders'   => $recentOrders,
            ],
        ]);
    }
}
