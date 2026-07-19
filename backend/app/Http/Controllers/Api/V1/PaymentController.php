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
            $payment = $this->paymentService->verify($reference);

            return response()->json([
                'message' => 'Payment verification complete.',
                'data'    => new PaymentResource($payment),
            ]);
        } catch (\Exception $e) {
            Log::error('Payment verification failed', ['ref' => $reference, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Verification failed: ' . $e->getMessage()], 400);
        }
    }

    public function webhook(Request $request, string $gateway): JsonResponse
    {
        // Example for Paystack webhook
        if ($gateway === 'paystack') {
            $event = $request->input('event');
            $data  = $request->input('data');

            if ($event === 'charge.success') {
                $reference = $data['reference'];
                try {
                    $this->paymentService->verify($reference);
                } catch (\Exception $e) {
                    Log::error('Webhook verification failed', ['ref' => $reference, 'error' => $e->getMessage()]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
