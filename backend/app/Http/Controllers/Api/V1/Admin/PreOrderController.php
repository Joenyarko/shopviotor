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

    public function confirmDeposit(Request $request, string $uuid)
    {
        $request->validate([
            'transaction_id' => 'nullable|string|max:100',
            'amount'         => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        $preOrder = PreOrder::where('uuid', $uuid)->firstOrFail();
        $deposit = $request->amount ? (float) $request->amount : (float) ($preOrder->product->preorder_deposit_amount ?? $preOrder->deposit_paid ?: $preOrder->total_price);
        $balance = max(0, (float) $preOrder->total_price - $deposit);
        $txId = $request->transaction_id ?? ('PRE-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5)));

        $preOrder->update([
            'deposit_paid'      => $deposit,
            'balance_remaining' => $balance,
            'status'            => 'processing',
        ]);

        return response()->json([
            'message' => 'Pre-order deposit confirmed successfully.',
            'data'    => $preOrder->load('product', 'user'),
        ]);
    }
}
