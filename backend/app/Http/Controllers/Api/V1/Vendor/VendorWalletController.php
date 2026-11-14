<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Models\StoreTransaction;
use App\Models\StoreWallet;
use App\Services\Payment\PaystackTransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorWalletController extends Controller
{
    public function __construct(
        private PaystackTransferService $transferService = new PaystackTransferService()
    ) {}

    private function getStore()
    {
        return auth()->user()->store;
    }

    public function banks(): JsonResponse
    {
        $banks = $this->transferService->getGhanaBanks();
        return response()->json(['data' => $banks]);
    }

    public function resolveAccount(Request $request): JsonResponse
    {
        $request->validate([
            'account_number' => 'required|string|min:8|max:20',
            'bank_code'      => 'required|string|max:20',
        ]);

        $res = $this->transferService->resolveAccount(
            $request->account_number,
            $request->bank_code
        );

        if (!$res['success']) {
            return response()->json([
                'message' => $res['message'] ?? 'Could not verify account holder name.',
            ], 422);
        }

        return response()->json(['data' => $res]);
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
            'payment_details' => 'nullable|string|max:500',
            'bank_code'       => 'nullable|string|max:50',
            'bank_name'       => 'nullable|string|max:100',
            'account_number'  => 'nullable|string|max:30',
            'account_name'    => 'nullable|string|max:100',
        ]);

        $amount = (float) $request->amount;

        try {
            // Attempt to register recipient code with Paystack if account info is provided
            $recipientCode = null;
            $paymentDetails = $request->payment_details;

            if ($request->account_number && $request->bank_code) {
                $accountName = $request->account_name ?: $store->name;
                $recipientRes = $this->transferService->createRecipient(
                    $accountName,
                    $request->account_number,
                    $request->bank_code
                );

                if ($recipientRes['success']) {
                    $recipientCode = $recipientRes['recipient_code'];
                }

                $paymentDetails = trim(
                    ($request->bank_name ? "{$request->bank_name} - " : '') .
                    "{$request->account_number} ({$accountName})"
                );

                // Save on store for future payouts
                $store->update([
                    'payout_bank_code'      => $request->bank_code,
                    'payout_bank_name'      => $request->bank_name,
                    'payout_account_number' => $request->account_number,
                    'payout_account_name'   => $accountName,
                    'payout_recipient_code' => $recipientCode,
                ]);
            }

            $payoutRequest = DB::transaction(function () use ($store, $amount, $request, $recipientCode, $paymentDetails) {
                // Ensure wallet exists and lock row to prevent concurrent extraction race conditions
                $wallet = StoreWallet::where('store_id', $store->id)
                    ->lockForUpdate()
                    ->first();

                if (!$wallet) {
                    $wallet = StoreWallet::create([
                        'store_id'          => $store->id,
                        'available_balance' => 0,
                        'pending_balance'   => 0,
                        'total_earned'      => 0,
                    ]);
                }

                if ($amount > (float)$wallet->available_balance) {
                    throw new \InvalidArgumentException('Insufficient available balance.');
                }

                // Deduct from available balance immediately
                $wallet->decrement('available_balance', $amount);

                $payout = $store->payoutRequests()->create([
                    'amount'          => $amount,
                    'status'          => 'pending',
                    'payment_method'  => $request->payment_method,
                    'payment_details' => $paymentDetails ?: ($request->payment_method . ' - ' . $store->phone),
                    'recipient_code'  => $recipientCode,
                ]);

                $store->transactions()->create([
                    'type'           => 'debit',
                    'amount'         => $amount,
                    'description'    => 'Withdrawal Request',
                    'status'         => 'pending',
                    'reference_type' => PayoutRequest::class,
                    'reference_id'   => $payout->id,
                ]);

                return $payout;
            });
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Payout requested successfully. It is now pending admin approval.',
            'data'    => $payoutRequest,
        ], 201);
    }
}
