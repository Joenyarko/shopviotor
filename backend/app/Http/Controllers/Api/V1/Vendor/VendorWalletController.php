<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Models\StoreTransaction;
use App\Models\StoreWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorWalletController extends Controller
{
    private function getStore()
    {
        return auth()->user()->store;
    }

    public function index(): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        // Get or create wallet
        $wallet = $store->wallet()->firstOrCreate(
            ['store_id' => $store->id],
            ['available_balance' => 0, 'pending_balance' => 0, 'total_earned' => 0]
        );

        $recentTransactions = $store->transactions()
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'wallet'       => $wallet,
            'transactions' => $recentTransactions,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $transactions = $store->transactions()
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }

    public function payouts(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $payouts = $store->payoutRequests()
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($payouts);
    }

    public function requestPayout(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) {
            return response()->json(['message' => 'You do not have an active store.'], 403);
        }

        $request->validate([
            'amount'          => 'required|numeric|min:10',
            'payment_method'  => 'required|string|max:50',
            'payment_details' => 'required|string|max:500',
        ]);

        $wallet = $store->wallet()->firstOrCreate(
            ['store_id' => $store->id],
            ['available_balance' => 0, 'pending_balance' => 0, 'total_earned' => 0]
        );

        $amount = (float) $request->amount;

        if ($amount > $wallet->available_balance) {
            return response()->json([
                'message' => 'Insufficient available balance.',
            ], 422);
        }

        $payoutRequest = DB::transaction(function () use ($store, $wallet, $amount, $request) {
            // Deduct from available balance immediately
            $wallet->decrement('available_balance', $amount);

            $payout = $store->payoutRequests()->create([
                'amount'          => $amount,
                'status'          => 'pending',
                'payment_method'  => $request->payment_method,
                'payment_details' => $request->payment_details,
            ]);

            $store->transactions()->create([
                'type'        => 'debit',
                'amount'      => $amount,
                'description' => 'Withdrawal Request',
                'status'      => 'pending',
                'reference_type' => PayoutRequest::class,
                'reference_id'   => $payout->id,
            ]);

            return $payout;
        });

        return response()->json([
            'message' => 'Payout requested successfully. It is now pending admin approval.',
            'data'    => $payoutRequest,
        ], 201);
    }
}
