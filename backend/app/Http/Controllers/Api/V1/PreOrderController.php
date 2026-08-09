<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PreOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            'product_id'                  => 'required|exists:products,uuid',
            'customer_details'            => 'required|array',
            'customer_details.name'       => 'required|string|max:255',
            'customer_details.phone'      => 'required|string|max:255',
            'customer_details.address'    => 'required|string|max:500',
        ]);

        $product = Product::where('uuid', $validated['product_id'])->firstOrFail();

        if (!$product->available_for_preorder) {
            return response()->json(['message' => 'Product is not available for pre-order.'], 400);
        }

        // ─── Prevent duplicate pre-orders ─────────────────────────────────────
        $existingActive = PreOrder::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->whereNotIn('status', ['cancelled', 'rejected', 'completed'])
            ->exists();

        if ($existingActive) {
            return response()->json([
                'message' => 'You already have an active pre-order for this product. Check your pre-orders page.',
            ], 409);
        }

        $deposit    = (float) ($product->preorder_deposit_amount ?? 0);
        $totalPrice = (float) $product->price;
        $balance    = max(0, $totalPrice - $deposit);

        $preOrder = DB::transaction(function () use ($request, $product, $validated, $deposit, $totalPrice, $balance) {
            return PreOrder::create([
                'user_id'           => $request->user()->id,
                'product_id'        => $product->id,
                'total_price'       => $totalPrice,
                'deposit_paid'      => 0,            // Will be updated after payment confirmed
                'balance_remaining' => $totalPrice,  // Full amount until deposit verified
                'expected_date'     => $product->preorder_expected_date,
                'status'            => 'pending',
                'customer_details'  => $validated['customer_details'],
            ]);
        });

        // ─── Payment for deposit ───────────────────────────────────────────────
        $isMockMode = empty(config('services.paystack.secret_key'));
        $paymentData = null;

        if ($deposit > 0 && !$isMockMode) {
            $paymentData = app(\App\Services\PaymentService::class)->initiate([
                'payable_type' => PreOrder::class,
                'payable_id'   => $preOrder->id,
                'user_id'      => $request->user()->id,
                'email'        => $request->user()->email,
                'amount'       => $deposit,
                'method'       => \App\Enums\PaymentMethod::Paystack,
            ]);
        }

        // In testing mode without keys: auto-record the deposit as "mock paid" so the flow works locally
        if ($deposit > 0 && $isMockMode) {
            $preOrder->update([
                'deposit_paid'      => $deposit,
                'balance_remaining' => $balance,
            ]);
        }

        return response()->json([
            'message'    => 'Pre-order placed successfully.' . ($isMockMode && $deposit > 0 ? ' (Testing Mode — deposit auto-credited)' : ''),
            'data'       => $preOrder->fresh()->load('product'),
            'deposit'    => $deposit,
            'payment'    => $paymentData,
            'mode'       => $isMockMode ? 'testing' : 'live',
        ], 201);
    }
}
