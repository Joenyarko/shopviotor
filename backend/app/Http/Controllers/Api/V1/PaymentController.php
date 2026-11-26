<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Repositories\PaymentRepository;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentRepository $paymentRepo,
        private PaymentService    $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $payments = $this->paymentRepo->getUserPayments(
            $request->user()->id,
            $request->input('per_page', 15)
        );

        return response()->json([
            'data' => PaymentResource::collection($payments)->response()->getData(true),
        ]);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $payment = $this->paymentRepo->findByUuid($uuid, ['transactions']);

        if ($request->user()->id !== $payment->user_id && !$request->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new PaymentResource($payment),
        ]);
    }

    public function verify(Request $request, string $reference): JsonResponse
    {
        try {
            // SECURITY: Ensure this payment belongs to the requesting user
            $payment = $this->paymentRepo->findByReference($reference);
            if ($payment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                abort(403, 'You are not authorized to verify this payment.');
            }

            $payment = $this->paymentService->verify($reference);

            return response()->json([
                'message' => 'Payment verification complete.',
                'data'    => new PaymentResource($payment),
            ]);
        } catch (\Exception $e) {
            Log::error('Payment verification failed', ['ref' => $reference, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Payment verification failed. Please contact support if you were charged.'], 400);
        }
    }

    public function webhook(Request $request, string $gateway): JsonResponse
    {
        if ($gateway === 'paystack') {
            // SECURITY: Verify Paystack webhook signature to prevent spoofed events
            $paystackSignature = $request->header('x-paystack-signature');
            $computedSignature = hash_hmac(
                'sha512',
                $request->getContent(),
                config('services.paystack.secret_key')
            );

            if (!$paystackSignature || !hash_equals($computedSignature, $paystackSignature)) {
                Log::warning('SECURITY: Invalid Paystack webhook signature received.', [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['status' => 'invalid signature'], 401);
            }

            $event = $request->input('event');
            $data  = $request->input('data');

            if ($event === 'charge.success') {
                $reference = $data['reference'] ?? null;
                if ($reference) {
                    try {
                        $this->paymentService->verify($reference);
                    } catch (\Exception $e) {
                        Log::error('Webhook verification failed', ['ref' => $reference, 'error' => $e->getMessage()]);
                    }
                }
            } elseif ($event === 'refund.processed') {
                $reference = $data['transaction_reference'] ?? $data['reference'] ?? null;
                if ($reference) {
                    try {
                        $payment = \App\Models\Payment::where('reference', $reference)->first();
                        if ($payment) {
                            $currentStatus = $payment->status instanceof \BackedEnum ? $payment->status->value : (string) $payment->status;
                            if ($currentStatus !== 'refunded') {
                                $refundAmount = isset($data['amount']) ? ((float) $data['amount'] / 100) : (float) $payment->amount;
                                $payment->update(['status' => 'refunded']);
                                $payment->transactions()->create([
                                    'type'                   => 'refund',
                                    'status'                 => 'success',
                                    'amount'                 => $refundAmount,
                                    'currency'               => strtoupper((string) ($data['currency'] ?? $payment->currency ?? 'GHS')),
                                    'gateway_transaction_id' => $data['id'] ?? null,
                                    'response'               => $data,
                                ]);

                                if ($payment->payable instanceof \App\Models\Order) {
                                    $orderStatus = $payment->payable->status instanceof \BackedEnum
                                        ? $payment->payable->status->value
                                        : (string) $payment->payable->status;
                                    if ($orderStatus !== 'cancelled') {
                                        app(\App\Services\OrderService::class)->updateStatus(
                                            $payment->payable,
                                            'cancelled',
                                            'Refund processed via Paystack'
                                        );
                                    }
                                }
                            }
                        }
                    } catch (\Throwable $e) {
                        Log::error('Webhook refund sync failed', ['ref' => $reference, 'error' => $e->getMessage()]);
                    }
                }
            } elseif ($event === 'transfer.success') {
                $reference = $data['reference'] ?? null;
                $transferCode = $data['transfer_code'] ?? null;
                $payout = \App\Models\PayoutRequest::where('transfer_reference', $reference)
                    ->orWhere('transfer_code', $transferCode)
                    ->first();

                if ($payout) {
                    $payout->update([
                        'transfer_status' => 'success',
                        'status'          => 'paid',
                    ]);
                    $payout->store?->transactions()
                        ->where('reference_type', \App\Models\PayoutRequest::class)
                        ->where('reference_id', $payout->id)
                        ->update(['status' => 'completed']);
                }
            } elseif ($event === 'transfer.failed' || $event === 'transfer.reversed') {
                $reference = $data['reference'] ?? null;
                $transferCode = $data['transfer_code'] ?? null;
                $payout = \App\Models\PayoutRequest::where('transfer_reference', $reference)
                    ->orWhere('transfer_code', $transferCode)
                    ->first();

                if ($payout && $payout->status !== 'rejected') {
                    $payout->update([
                        'transfer_status' => 'failed',
                        'status'          => 'rejected',
                        'admin_notes'     => 'Paystack Transfer failed or reversed: ' . ($data['gateway_response'] ?? 'Unknown error'),
                    ]);

                    $wallet = \App\Models\StoreWallet::where('store_id', $payout->store_id)->first();
                    if ($wallet) {
                        $wallet->increment('available_balance', $payout->amount);
                    }

                    $payout->store?->transactions()
                        ->where('reference_type', \App\Models\PayoutRequest::class)
                        ->where('reference_id', $payout->id)
                        ->update(['status' => 'cancelled']);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $payments = \App\Models\Payment::latest()->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => PaymentResource::collection($payments)->response()->getData(true),
        ]);
    }

    public function adminConfirm(Request $request, string $uuid): JsonResponse
    {
        try {
            $payment = \App\Models\Payment::where('uuid', $uuid)->firstOrFail();
            $payment = $this->paymentService->adminConfirm($payment, $request->user()->id);

            return response()->json([
                'message' => 'Payment marked as completed.',
                'data'    => new PaymentResource($payment),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Admin payment confirmation failed: ' . $e->getMessage(), [
                'uuid'  => $uuid,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to confirm payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function adminVerify(Request $request, string $uuid): JsonResponse
    {
        try {
            $payment = \App\Models\Payment::where('uuid', $uuid)->firstOrFail();
            $verified = $this->paymentService->verify($payment->reference);

            return response()->json([
                'message' => 'Payment re-verified with Paystack.',
                'data'    => new PaymentResource($verified),
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin Paystack re-verification failed: ' . $e->getMessage(), ['uuid' => $uuid]);

            return response()->json([
                'message' => 'Paystack verification failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function clearTestPayments(): JsonResponse
    {
        \App\Models\PaymentTransaction::query()->delete();
        \App\Models\Payment::query()->delete();

        return response()->json([
            'message' => 'All test payment audits have been cleared successfully.'
        ]);
    }
}
