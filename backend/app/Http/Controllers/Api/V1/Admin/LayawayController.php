<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LayawayController extends Controller
{
    public function index(): JsonResponse
    {
        $cards = LayawayCard::with(['user:id,name,phone', 'product:id,name,price'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = $cards->map(function ($card) {
            $totalPaid = $card->payments()->sum('amount');
            $boxesChecked = $card->payments()->sum('boxes_covered');

            return [
                'uuid' => $card->uuid,
                'customer_name' => $card->user->name,
                'product_name' => $card->product->name,
                'total_boxes' => $card->total_boxes,
                'boxes_checked' => (int) $boxesChecked,
                'amount_paid' => (float) $totalPaid,
                'status' => $card->status,
                'created_at' => $card->created_at->toISOString(),
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    public function show(string $uuid): JsonResponse
    {
        $card = LayawayCard::where('uuid', $uuid)
            ->with(['user:id,name,phone,city,address', 'product:id,uuid,name', 'product.images', 'payments' => function($q) {
                $q->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        $totalPaid = $card->payments->sum('amount');
        $boxesChecked = $card->payments->sum('boxes_covered');
        $totalAmount = $card->total_boxes * $card->box_price;

        return response()->json([
            'data' => [
                'uuid' => $card->uuid,
                'product_name' => $card->product->name,
                'customer_name' => $card->user->name,
                'customer_phone' => $card->user->phone ?? 'N/A',
                'customer_city' => $card->user->city ?? 'N/A',
                'total_boxes' => $card->total_boxes,
                'boxes_checked' => (int) $boxesChecked,
                'boxes_remaining' => $card->total_boxes - $boxesChecked,
                'box_price' => (float) $card->box_price,
                'total_amount' => (float) $totalAmount,
                'amount_paid' => (float) $totalPaid,
                'amount_remaining' => (float) $totalAmount - $totalPaid,
                'completion_percentage' => round(($boxesChecked / $card->total_boxes) * 100, 2),
                'status' => $card->status,
                'payments' => $card->payments->map(function ($payment) {
                    return [
                        'uuid' => $payment->uuid,
                        'amount' => (float) $payment->amount,
                        'boxes_covered' => $payment->boxes_covered,
                        'payment_method' => $payment->payment_method,
                        'reference' => $payment->reference,
                        'notes' => $payment->notes,
                        'color_code' => $payment->color_code,
                        'created_at' => $payment->created_at->toISOString(),
                    ];
                })
            ]
        ]);
    }

    public function storePayment(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'amount_paid' => 'nullable|numeric|min:0',
            'number_of_boxes' => 'nullable|integer|min:0',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $card = LayawayCard::where('uuid', $uuid)->firstOrFail();

        if ($card->status === 'completed') {
            return response()->json(['message' => 'This layaway is already completed.'], 400);
        }

        $boxPrice = (float) $card->box_price;
        
        // Admin can enter EITHER amount OR boxes
        $amount = (float) $request->amount_paid;
        $boxes = (int) $request->number_of_boxes;

        if ($amount > 0) {
            $boxes = (int) round($amount / $boxPrice);
        } else if ($boxes > 0) {
            $amount = $boxes * $boxPrice;
        } else {
            return response()->json(['message' => 'Please enter an amount or number of boxes.'], 400);
        }

        $currentBoxes = $card->payments()->sum('boxes_covered');
        $remainingBoxes = $card->total_boxes - $currentBoxes;

        if ($boxes > $remainingBoxes) {
            return response()->json([
                'message' => "Payment exceeds remaining boxes. Only {$remainingBoxes} boxes left."
            ], 422);
        }

        $paymentCount = $card->payments()->count();
        $colorCode = ($paymentCount % 2 === 0) ? '#eab308' : '#000000'; // Yellow and Black

        DB::transaction(function () use ($card, $amount, $boxes, $request, $colorCode, $currentBoxes) {
            $card->payments()->create([
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'amount' => $amount,
                'boxes_covered' => $boxes,
                'payment_method' => $request->payment_method,
                'reference' => 'ADMIN-' . strtoupper(uniqid()),
                'notes' => $request->notes,
                'color_code' => $colorCode,
            ]);

            if ($currentBoxes + $boxes >= $card->total_boxes) {
                $card->update(['status' => 'completed']);
            }
        });

        return response()->json([
            'message' => 'Payment recorded successfully.'
        ]);
    }
