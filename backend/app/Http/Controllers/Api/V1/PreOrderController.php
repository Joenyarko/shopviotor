<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PreOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PreOrderController extends Controller
{
    public function index(Request $request)
    {
        $preOrders = PreOrder::with('product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $preOrders]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,uuid',
            'customer_details' => 'required|array',
            'customer_details.name' => 'required|string|max:255',
            'customer_details.phone' => 'required|string|max:255',
            'customer_details.address' => 'required|string|max:500',
        ]);

        $product = Product::where('uuid', $validated['product_id'])->firstOrFail();

        if (!$product->available_for_preorder) {
            return response()->json(['message' => 'Product is not available for pre-order.'], 400);
        }

        $deposit = $product->preorder_deposit_amount ?? 0;
        $totalPrice = $product->price;

        $preOrder = DB::transaction(function () use ($request, $product, $validated, $deposit, $totalPrice) {
            return PreOrder::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'total_price' => $totalPrice,
                'deposit_paid' => $deposit,
                'balance_remaining' => max(0, $totalPrice - $deposit),
                'expected_date' => $product->preorder_expected_date,
                'status' => 'pending',
                'customer_details' => $validated['customer_details'],
            ]);
        });

        return response()->json([
            'message' => 'Pre-order placed successfully.',
            'data' => $preOrder->load('product'),
        ], 201);
    }
}
