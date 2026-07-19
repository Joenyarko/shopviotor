<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\PurchaseTicketRequest;
use App\Http\Resources\RaffleResource;
use App\Models\Raffle;
use App\Services\PaymentService;
use App\Services\RaffleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RaffleController extends Controller
{
    public function __construct(
        private RaffleService  $raffleService,
        private PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $raffles = Raffle::active()->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => RaffleResource::collection($raffles)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->with('product')->firstOrFail();

        return response()->json([
            'data' => new RaffleResource($raffle),
        ]);
    }

    public function purchaseTicket(PurchaseTicketRequest $request, string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->active()->firstOrFail();
        $user   = $request->user();
        $data   = $request->validated();

        // 1. Initiate Payment
        $paymentData = $this->paymentService->initiate([
            'payable_type' => Raffle::class,
            'payable_id'   => $raffle->id,
            'user_id'      => $user->id,
            'email'        => $user->email,
            'amount'       => $raffle->ticket_price,
            'method'       => $data['payment_method'],
            'phone'        => $data['payment_phone'] ?? null,
            'provider'     => $data['payment_provider'] ?? null,
        ]);

        // Note: The actual ticket generation ($this->raffleService->purchaseTicket) 
        // should ideally happen when the payment is verified via webhook/listener.
        // For synchronous flows or manual transfers, it might be handled differently.

        return response()->json([
            'message' => 'Payment initiated. Ticket will be generated upon successful payment.',
            'payment' => $paymentData,
        ]);
    }
}
