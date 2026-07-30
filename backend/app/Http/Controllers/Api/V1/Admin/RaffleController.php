<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRaffleRequest;
use App\Http\Requests\Admin\UpdateRaffleRequest;
use App\Models\Raffle;
use App\Models\RaffleWinner;
use App\Models\RaffleTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class RaffleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $raffles = Raffle::with('product')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($raffles);
    }

    public function store(StoreRaffleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['uuid'] = Str::uuid()->toString();
        $data['created_by'] = $request->user()->id;
        $data['prize_description'] = $data['prize_description'] ?? $data['title'] ?? 'Raffle Prize';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->storeOnCloudinary('raffles')->getSecurePath();
            $data['image'] = url('storage/' . $path);
        } elseif (isset($data['image']) && is_string($data['image'])) {
            // Keep the string URL if passed directly
        } else {
            unset($data['image']);
        }

        $raffle = Raffle::create($data);

        return response()->json([
            'message' => 'Raffle created successfully.',
            'data'    => $raffle->load('product'),
        ], 201);
    }

    public function update(UpdateRaffleRequest $request, string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->firstOrFail();
        
        $data = $request->validated();
        if (isset($data['title']) && !isset($data['prize_description'])) {
            $data['prize_description'] = $data['title'];
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->storeOnCloudinary('raffles')->getSecurePath();
            $data['image'] = url('storage/' . $path);
        } elseif (isset($data['image']) && is_string($data['image'])) {
            // Keep the string URL
        } else {
            unset($data['image']);
        }

        $raffle->update($data);

        return response()->json([
            'message' => 'Raffle updated successfully.',
            'data'    => $raffle->fresh()->load('product'),
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->firstOrFail();
        
        if ($raffle->tickets()->exists()) {
            return response()->json([
                'message' => 'Cannot delete raffle that already has tickets sold.',
            ], 422);
        }

        $raffle->delete();

        return response()->json([
            'message' => 'Raffle deleted successfully.',
        ]);
    }

    public function draw(string $uuid): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->firstOrFail();

        if ($raffle->status !== \App\Enums\RaffleStatus::Closed && $raffle->status !== \App\Enums\RaffleStatus::Active) {
            return response()->json([
                'message' => 'Cannot draw a winner for this raffle status.',
            ], 422);
        }

        if (\App\Models\RaffleWinner::where('raffle_id', $raffle->id)->exists()) {
            return response()->json([
                'message' => 'Winner has already been drawn for this raffle.',
            ], 422);
        }

        // 1. Get all ticket IDs for the raffle
        $ticketIds = $raffle->tickets()->orderBy('id')->pluck('id')->toArray();
        $totalTickets = count($ticketIds);

        if ($totalTickets === 0) {
            return response()->json([
                'message' => 'No tickets sold for this raffle.',
            ], 422);
        }

        // 2. Cryptographic Lottery Algorithm
        // Generate a highly unpredictable seed using current microtime, total tickets, and a random cryptographic string.
        $serverTime = microtime(true);
        $cryptoString = bin2hex(random_bytes(16));
        $seedString = "{$uuid}-{$totalTickets}-{$serverTime}-{$cryptoString}";

        // Hash the seed using SHA-256
        $hash = hash('sha256', $seedString);

        // Take the first 15 characters of the hash and convert it to a large integer
        $hashSubset = substr($hash, 0, 15);
        $largeInt = hexdec($hashSubset);

        // Modulo the total tickets to get a deterministic fair index
        $winningIndex = $largeInt % $totalTickets;
        $winningTicketId = $ticketIds[$winningIndex];

        $winningTicket = \App\Models\RaffleTicket::find($winningTicketId);

        $raffle->update([
            'status'    => \App\Enums\RaffleStatus::Completed,
        ]);

        $winningTicket->update(['is_winner' => true]);

        \App\Models\RaffleWinner::create([
            'raffle_id'        => $raffle->id,
            'raffle_ticket_id' => $winningTicket->id,
            'user_id'          => $winningTicket->user_id,
        ]);

        return response()->json([
            'message' => 'Winner drawn successfully.',
            'data'    => $raffle->load('winner'),
        ]);
    }

    public function winners(Request $request): JsonResponse
    {
        $winners = RaffleWinner::with(['user', 'raffle.product'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($winners);
    }

    public function tickets(string $uuid, Request $request): JsonResponse
    {
        $raffle = Raffle::where('uuid', $uuid)->firstOrFail();
        $tickets = RaffleTicket::where('raffle_id', $raffle->id)
            ->with('user')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($tickets);
    }
}
