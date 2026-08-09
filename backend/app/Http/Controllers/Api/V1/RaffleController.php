<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\PurchaseTicketRequest;
use App\Http\Resources\RaffleResource;
use App\Models\Raffle;
use App\Services\RaffleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RaffleController extends Controller
{
    public function __construct(private RaffleService $raffleService) {}

    public function index(Request $request): JsonResponse
    {
        $raffles = Raffle::active()->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => RaffleResource::collection($raffles)->response()->getData(true),
        ]);
    }

    public function winners(Request $request): JsonResponse
    {
        $limit   = $request->input('limit', 8);
        $winners = \App\Models\RaffleWinner::with(['user', 'raffle.product'])->latest()->take($limit)->get();

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

        return response()->json(['data' => $formatted]);
    }

    public function show(string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->with('product')->firstOrFail();
        return response()->json(['data' => new RaffleResource($raffle)]);
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
        $user     = $request->user();
        $data     = $request->validated();
        $quantity = $data['quantity'] ?? 1;

        // Lock the raffle row to prevent oversell race conditions
        $raffle = DB::transaction(function () use ($uuid, $user, $quantity) {
            $raffle = Raffle::where('uuid', $uuid)->active()->lockForUpdate()->firstOrFail();

            // Check max per user
            if ($raffle->max_per_user) {
                $userTotalTickets = \App\Models\RaffleTicket::where('raffle_id', $raffle->id)
                    ->where('user_id', $user->id)
                    ->count();

                if (($userTotalTickets + $quantity) > $raffle->max_per_user) {
                    abort(422, 'You cannot purchase this many tickets. Maximum allowed per user is ' .
                        $raffle->max_per_user . '. You currently have ' . $userTotalTickets . ' ticket(s).');
                }
            }

            // Fresh DB count to avoid stale tickets_sold value
            $soldCount = \App\Models\RaffleTicket::where('raffle_id', $raffle->id)->count();
            if ($raffle->max_tickets && ($soldCount + $quantity) > $raffle->max_tickets) {
                abort(422, 'Not enough tickets available. Only ' . ($raffle->max_tickets - $soldCount) . ' left.');
            }

            return $raffle;
        });

        // ─── Payment ──────────────────────────────────────────────────────────
        // In TESTING MODE: tickets are issued with a mock payment reference.
        // When PAYSTACK_SECRET_KEY is set in .env, replace this block with
        // PaymentService::initiate() and only issue tickets after webhook confirms payment.
        $isMockMode = empty(config('services.paystack.secret_key'));

        $tickets = [];
        if ($isMockMode) {
            // Testing: generate tickets immediately with a server-side reference
            for ($i = 0; $i < $quantity; $i++) {
                $reference = 'MOCK-RAFFLE-' . strtoupper(Str::random(12));
                $tickets[] = $this->raffleService->purchaseTicket($user->id, $raffle, $reference);
            }

            return response()->json([
                'message' => 'Tickets issued successfully (Testing Mode — no real payment charged).',
                'mode'    => 'testing',
                'tickets' => $tickets,
            ]);
        }

        $paymentData = null;
        if (!$isMockMode) {
            $paymentData = app(\App\Services\PaymentService::class)->initiate([
                'payable_type' => Raffle::class,
                'payable_id'   => $raffle->id,
                'user_id'      => $user->id,
                'email'        => $user->email,
                'amount'       => $totalPrice,
                'method'       => \App\Enums\PaymentMethod::Paystack,
            ]);
        }

        return response()->json([
            'message' => 'Payment initiated successfully.',
            'payment' => $paymentData,
        ]);
    }
}
