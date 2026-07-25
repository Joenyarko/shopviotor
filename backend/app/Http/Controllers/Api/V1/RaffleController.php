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

    public function winners(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 8);
        $winners = \App\Models\RaffleWinner::with(['user', 'raffle.product'])->latest()->take($limit)->get();

        // Format as expected by frontend
        $formatted = $winners->map(function ($winner) {
            return [
                'id'           => $winner->id,
                'user_name'    => $winner->user->name ?? 'Anonymous',
                'raffle_title' => $winner->raffle->product->name ?? 'Unknown Product',
                'ticket_price' => $winner->raffle->ticket_price,
                'draw_date'    => $winner->created_at->format('Y-m-d'),
                'image_url'    => $winner->raffle->product->primary_image ?? null,
            ];
        });

        return response()->json([
            'data' => $formatted,
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->with('product')->firstOrFail();

        return response()->json([
            'data' => new RaffleResource($raffle),
        ]);
    }

    public function myTickets(Request $request): JsonResponse
    {
        $tickets = \App\Models\RaffleTicket::where('user_id', $request->user()->id)
            ->with(['raffle', 'raffle.product'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => $tickets->items(),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page'    => $tickets->lastPage(),
                'total'        => $tickets->total(),
            ]
        ]);
    }

    public function purchaseTicket(PurchaseTicketRequest $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        
        $raffle = Raffle::where('uuid', $uuid)->active()->firstOrFail();
        $data   = $request->validated();
        $quantity = $data['quantity'] ?? 1;

        // Check Max Per User
        if ($raffle->max_per_user) {
            $userTotalTickets = \App\Models\RaffleTicket::where('raffle_id', $raffle->id)
                ->where('user_id', $user->id)
                ->count();
            
            if (($userTotalTickets + $quantity) > $raffle->max_per_user) {
                return response()->json([
                    'message' => 'You cannot purchase this many tickets. The maximum allowed per user is ' . $raffle->max_per_user . '. You currently have ' . $userTotalTickets . ' ticket(s).',
                ], 422);
            }
        }

        // 1. For testing purposes, we skip the actual payment gateway redirection
        // and immediately generate the requested tickets.
        $tickets = [];
        
        for ($i = 0; $i < $quantity; $i++) {
            $tickets[] = $this->raffleService->purchaseTicket($user->id, $raffle, 'test_ref_' . uniqid());
        }

        return response()->json([
            'message' => 'Payment successful (Testing mode). Tickets generated!',
            'payment' => [
                'authorization_url' => null, // Skip redirect
            ],
            'tickets' => $tickets
        ]);
    }
}
