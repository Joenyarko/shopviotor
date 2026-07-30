<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPayoutController extends Controller
{
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
            'action'      => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $payout = PayoutRequest::where('uuid', $uuid)->with('store.wallet')->firstOrFail();

        if ($payout->status !== 'pending') {
            return response()->json(['message' => 'This payout request is no longer pending.'], 422);
        }

        DB::transaction(function () use ($payout, $request) {
            $store = $payout->store;
            
            if ($request->action === 'approve') {
                $payout->update([
                    'status'       => 'paid',
                    'admin_notes'  => $request->admin_notes,
                    'processed_at' => now(),
                    'processed_by' => $request->user()->id,
                ]);

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

                $store->wallet->increment('available_balance', $payout->amount);

                // Mark the transaction as cancelled
                $store->transactions()
                    ->where('reference_type', PayoutRequest::class)
                    ->where('reference_id', $payout->id)
                    ->update(['status' => 'cancelled']);
            }
        });

        return response()->json([
            'message' => 'Payout request ' . ($request->action === 'approve' ? 'approved and paid' : 'rejected and refunded') . '.',
            'data'    => $payout->fresh(),
        ]);
    }
}
