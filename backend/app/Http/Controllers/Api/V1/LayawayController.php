<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LayawayCard;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LayawayController extends Controller
{
    public function index(): JsonResponse
    {
        $cards = LayawayCard::where('user_id', auth()->id())
            ->with(['product:id,uuid,name,price,slug', 'product.images' => function($query) {
                $query->where('is_primary', true)->orWhere('sort_order', 0);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = $cards->map(function ($card) {
            $totalPaid = $card->payments()->sum('amount');
            $boxesChecked = $card->payments()->sum('boxes_covered');
            
            return [
                'uuid' => $card->uuid,
                'product_name' => $card->product->name,
                'product_image' => $card->product->images->first()?->path,
                'total_boxes' => $card->total_boxes,
                'box_price' => (float) $card->box_price,
                'status' => $card->status,
                'boxes_checked' => (int) $boxesChecked,
                'amount_paid' => (float) $totalPaid,
                'amount_remaining' => (float) ($card->total_boxes * $card->box_price) - $totalPaid,
                'created_at' => $card->created_at->toISOString(),
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || $user->student_verification_status !== 'approved') {
            return response()->json([
                'message' => 'You must have an approved student ID to request a layaway.',
                'errors' => ['student_id' => ['You must have an approved student ID to request a layaway.']]
            ], 422);
        }

        $request->validate([
            'product_uuid' => 'required|exists:products,uuid',
        ]);

        $product = Product::where('uuid', $request->product_uuid)
            ->where(function ($query) {
                $query->where('is_layaway', true)
                      ->orWhere('available_for_layaway', true);
            })
            ->firstOrFail();

        $boxes = $product->layaway_boxes ?? $product->layaway_total_boxes;

        if (!$boxes || $boxes <= 0) {
            return response()->json(['message' => 'This product is missing layaway box configuration.'], 400);
        }

        $card = LayawayCard::create([
            'uuid' => Str::uuid()->toString(),
            'user_id' => auth()->id(),
            'product_id' => $product->id,
            'total_boxes' => $boxes,
            'box_price' => $product->layaway_box_price ?? ($product->price / $boxes),
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Layaway card registered successfully.',
            'data' => ['uuid' => $card->uuid]
        ], 201);
    }

    public function show(string $uuid): JsonResponse
    {
        $card = LayawayCard::where('uuid', $uuid)
            ->where('user_id', auth()->id())
            ->with(['product:id,uuid,name', 'product.images', 'payments' => function($q) {
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
                'customer_name' => auth()->user()->name,
                'customer_phone' => auth()->user()->phone ?? 'N/A',
                'customer_city' => auth()->user()->city ?? 'N/A',
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

    public function pay(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'amount'    => 'required|numeric|min:1',
            'reference' => 'required|string|max:255',
        ]);

        $card = LayawayCard::where('uuid', $uuid)
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->firstOrFail();

        // ─── Prevent reference replay attacks ─────────────────────────────────
        $refAlreadyUsed = $card->payments()->where('reference', $request->reference)->exists();
        if ($refAlreadyUsed) {
            return response()->json([
                'message' => 'This payment reference has already been used.',
            ], 422);
        }

        // ─── Verify payment with gateway ───────────────────────────────────────
        // TESTING MODE: accept any reference (mock mode).
        // In production: verify with Paystack before recording payment.
        $isMockMode = empty(config('services.paystack.secret_key'));

        if (!$isMockMode) {
            // TODO: Uncomment when Paystack is configured
            // try {
            //     $result = app(PaymentService::class)->verifyReference($request->reference);
            //     if (!$result['success'] || abs($result['amount'] - $request->amount) > 0.01) {
            //         return response()->json(['message' => 'Payment verification failed.'], 422);
            //     }
            // } catch (\Exception $e) {
            //     return response()->json(['message' => 'Could not verify payment: ' . $e->getMessage()], 502);
            // }
        }

        $amount   = (float) $request->amount;
        $boxPrice = (float) $card->box_price;

        // Allow small floating point tolerance
        if (fmod($amount, $boxPrice) > 0.01 && fmod($amount, $boxPrice) < ($boxPrice - 0.01)) {
            return response()->json([
                'message' => "Amount must be a multiple of the box price (GHS {$boxPrice}).",
            ], 422);
        }

        $boxesCovered = (int) round($amount / $boxPrice);

        // Check remaining boxes
        $currentBoxes   = $card->payments()->sum('boxes_covered');
        $remainingBoxes = $card->total_boxes - $currentBoxes;

        if ($boxesCovered > $remainingBoxes) {
            return response()->json([
                'message' => "Payment exceeds remaining boxes. Only {$remainingBoxes} boxes left.",
            ], 422);
        }

        // Alternating yellow/black color per payment
        $paymentCount = $card->payments()->count();
        $colorCode    = ($paymentCount % 2 === 0) ? '#eab308' : '#000000';

        DB::transaction(function () use ($card, $amount, $boxesCovered, $request, $colorCode, $currentBoxes) {
            $card->payments()->create([
                'uuid'           => Str::uuid()->toString(),
                'amount'         => $amount,
                'boxes_covered'  => $boxesCovered,
                'payment_method' => 'Paystack',
                'reference'      => $request->reference,
                'notes'          => 'Online payment',
                'color_code'     => $colorCode,
            ]);

            if (($currentBoxes + $boxesCovered) >= $card->total_boxes) {
                $card->update(['status' => 'completed']);
            }
        });

        return response()->json([
            'message' => 'Payment recorded successfully.' . (empty(config('services.paystack.secret_key')) ? ' (Testing Mode)' : ''),
        ]);
    }


    public function terms(): JsonResponse
    {
        return response()->json([
            'data' => [
                'layaway_terms' => "1. All layaway plans are subject to the total amount and box counts specified by the admin.\n2. Payments are non-refundable unless explicitly agreed upon.\n3. The item will be reserved for you exclusively until the layaway is fully paid.\n4. You may make payments at any time. Once all boxes are checked, the item will be shipped to you.\n5. Failure to complete payments within an exceptionally long period may result in plan cancellation based on management discretion."
            ]
        ]);
    }
}
