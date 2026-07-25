<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HirePurchaseResource;
use App\Http\Resources\HirePurchaseInstallmentResource;
use App\Models\HirePurchase;
use App\Services\HirePurchaseService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HirePurchaseController extends Controller
{
    public function __construct(
        private HirePurchaseService $hpService,
        private PaymentService      $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $hps = HirePurchase::where('user_id', $request->user()->id)
            ->with(['product.primaryImage'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => HirePurchaseResource::collection($hps)->response()->getData(true),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'      => ['required', 'string'],
            'deposit_amount'  => ['required', 'numeric', 'min:0'],
            'duration_months' => ['required', 'integer', 'min:1', 'max:120'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ]);

        $hp = $this->hpService->create($request->user()->id, $data);

        return response()->json([
            'message' => 'Hire purchase agreement created successfully.',
            'data'    => new HirePurchaseResource($hp),
        ], 201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $hp = HirePurchase::where('uuid', $uuid)->with(['product', 'installments'])->firstOrFail();

        if ($request->user()->id !== $hp->user_id && !$request->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new HirePurchaseResource($hp),
        ]);
    }

    public function payInstallment(Request $request, string $uuid, int $installmentId): JsonResponse
    {
        $hp = HirePurchase::where('uuid', $uuid)->firstOrFail();

        if ($request->user()->id !== $hp->user_id) {
            abort(403);
        }

        $installment = $hp->installments()->findOrFail($installmentId);

        $data = $request->validate([
            'payment_method'   => ['required', 'in:paystack,mobile_money,bank_transfer'],
            'payment_phone'    => ['required_if:payment_method,mobile_money', 'string'],
            'payment_provider' => ['required_if:payment_method,mobile_money', 'in:mtn,vodafone,tigo'],
        ]);

        $amountToPay = $installment->amount_due + ($installment->isOverdue() ? $hp->late_fee : 0);

        $paymentData = $this->paymentService->initiate([
            'payable_type' => HirePurchase::class, // Or Installment::class depending on logic
            'payable_id'   => $hp->id, // Tying to HP
            'user_id'      => $request->user()->id,
            'email'        => $request->user()->email,
            'amount'       => $amountToPay,
            'method'       => $data['payment_method'],
            'phone'        => $data['payment_phone'] ?? null,
            'provider'     => $data['payment_provider'] ?? null,
        ]);

        // Note: The actual installment status update will happen via webhook/payment verification.
        // The service logic for $this->hpService->payInstallment() would be called in the listener.

        return response()->json([
            'message' => 'Payment initiated.',
            'payment' => $paymentData,
        ]);
    }
}
