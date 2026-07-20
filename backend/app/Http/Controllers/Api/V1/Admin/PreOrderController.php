<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreOrder;
use Illuminate\Http\Request;

class PreOrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = PreOrder::with(['product', 'user'])->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $preOrders = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => $preOrders->items(),
            'meta' => [
                'current_page' => $preOrders->currentPage(),
                'last_page' => $preOrders->lastPage(),
                'total' => $preOrders->total(),
            ]
        ]);
    }

    public function updateStatus(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,arrived,completed,cancelled'
        ]);

        $preOrder = PreOrder::where('uuid', $uuid)->firstOrFail();
        $preOrder->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Pre-order status updated successfully.',
            'data' => $preOrder->load('product', 'user')
        ]);
    }
}
