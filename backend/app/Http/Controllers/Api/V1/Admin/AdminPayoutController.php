<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Services\Payment\PaystackTransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminPayoutController extends Controller
{
    public function __construct(
        private PaystackTransferService $transferService = new PaystackTransferService()
    ) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $payouts = PayoutRequest::with('store')
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json($payouts);
    }

    public function process(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'action'        => 'required|in:approve,reject',
            'disburse_via'  => 'nullable|in:manual,paystack',
            'admin_notes'   => 'nullable|string|max:500',
        ]);

        $disburseVia = $request->input('disburse_via', 'manual');

        return DB::transaction(function () use ($uuid, $request, $disburseVia) {
            $payout = PayoutRequest::where('uuid', $uuid)->lockForUpdate()->firstOrFail();

            if ($payout->status !== 'pending') {
                return response()->json(['message' => 'This payout request is no longer pending.'], 422);
            }

            $store = $payout->store;
            $wallet = \App\Models\StoreWallet::where('store_id', $store->id)->lockForUpdate()->first();

            if ($request->action === 'approve') {
                $transferData = [];

                if ($disburseVia === 'paystack') {
                    // Determine or create recipient code
                    $recipientCode = $payout->recipient_code ?: $store->payout_recipient_code;

                    if (!$recipientCode && $store->payout_account_number && $store->payout_bank_code) {
                        $recRes = $this->transferService->createRecipient(
                            $store->payout_account_name ?: $store->name,
                            $store->payout_account_number,
                            $store->payout_bank_code
                        );

                        if ($recRes['success']) {
                            $recipientCode = $recRes['recipient_code'];
                            $payout->update(['recipient_code' => $recipientCode]);
                            $store->update(['payout_recipient_code' => $recipientCode]);
                        }
                    }

                    if (!$recipientCode) {
                        return response()->json([
                            'message' => 'Cannot disburse via Paystack: Recipient code missing. Please verify the vendor account details first or choose Manual transfer.',
                        ], 422);
                    }

                    $transferRef = 'VIO-TRF-' . strtoupper(Str::random(10));
                    $transferRes = $this->transferService->initiateTransfer(
                        (float) $payout->amount,
                        $recipientCode,
                        "Viotor Payout for {$store->name}",
                        $transferRef
                    );

                    if (!$transferRes['success']) {
                        return response()->json([
                            'message' => 'Paystack Transfer Failed: ' . ($transferRes['message'] ?? 'Unable to disburse funds. Check Paystack balance.'),
                        ], 400);
                    }

                    $transferData = [
                        'disbursed_via'      => 'paystack',
                        'transfer_code'      => $transferRes['transfer_code'] ?? null,
                        'transfer_reference' => $transferRef,
                        'transfer_status'    => $transferRes['status'] ?? 'pending',
                    ];
                } else {
                    $transferData = [
                        'disbursed_via' => 'manual',
                    ];
                }

                $payout->update(array_merge([
                    'status'       => 'paid',
                    'admin_notes'  => $request->admin_notes,
                    'processed_at' => now(),
                    'processed_by' => $request->user()->id,
                ], $transferData));

                // Mark the transaction as completed
                $store->transactions()
                    ->where('reference_type', PayoutRequest::class)
                    ->where('reference_id', $payout->id)
                    ->update(['status' => 'completed']);

            } else {
                // Reject: refund the money back to the wallet
                $payout->update([
                    'status'       => 'rejected',
                    'admin_notes'  => $request->admin_notes,
                    'processed_at' => now(),
                    'processed_by' => $request->user()->id,
                ]);

                if ($wallet) {
                    $wallet->increment('available_balance', $payout->amount);
                }

                // Mark the transaction as cancelled
                $store->transactions()
                    ->where('reference_type', PayoutRequest::class)
                    ->where('reference_id', $payout->id)
                    ->update(['status' => 'cancelled']);
            }

            $successMsg = $request->action === 'approve'
                ? ($disburseVia === 'paystack' ? 'Payout disbursed successfully via Paystack!' : 'Payout marked as paid manually.')
                : 'Payout request rejected and refunded to vendor.';

            return response()->json([
                'message' => $successMsg,
                'data'    => $payout->fresh(),
            ]);
        });
    }
}
