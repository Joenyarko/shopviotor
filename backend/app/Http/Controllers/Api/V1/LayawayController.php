<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LayawayCard;
use App\Models\LayawayPlanCard;
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
            }, 'layawayPlanCard'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = $cards->map(function ($card) {
            $totalPaid = $card->payments()->sum('amount');
            $boxesChecked = $card->payments()->sum('boxes_covered');
            
            $productName = $card->product ? $card->product->name : ($card->layawayPlanCard ? $card->layawayPlanCard->name : 'Unknown');
            $productImage = $card->product ? $card->product->images->first()?->path : ($card->layawayPlanCard ? $card->layawayPlanCard->image_url : null);
            
            return [
                'uuid' => $card->uuid,
                'product_name' => $productName,
                'product_image' => $productImage,
                'total_boxes' => $card->total_boxes,
                'box_price' => (float) $card->box_price,
                'status' => $card->status,
                'boxes_checked' => (int) $boxesChecked,
                'amount_paid' => (float) $totalPaid,
                'amount_remaining' => (float) ($card->total_boxes * $card->box_price) - $totalPaid,
                'created_at' => $card->created_at->toISOString(),
                'is_plan_card' => $card->layaway_plan_card_id !== null,
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    public function cards(Request $request): JsonResponse
    {
        $query = LayawayPlanCard::where('status', 'active');
        
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        if ($request->sort) {
            if ($request->sort === 'name_asc') {
                $query->orderBy('name', 'asc');
            } elseif ($request->sort === 'name_desc') {
                $query->orderBy('name', 'desc');
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 12);
        $cards = $query->paginate($perPage);
        
        return response()->json([
            'data' => $cards->items(),
            'meta' => [
                'current_page' => $cards->currentPage(),
                'last_page' => $cards->lastPage(),
                'total' => $cards->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'You must be logged in to request a layaway.',
            ], 401);
        }

        $request->validate([
            'product_uuid' => 'nullable|exists:products,uuid',
            'plan_card_uuid' => 'nullable|exists:layaway_plan_cards,uuid',
            'pickup_point' => 'required|string|max:255',
        ]);

        if (!$request->product_uuid && !$request->plan_card_uuid) {
            return response()->json(['message' => 'You must select a product or a layaway card.'], 422);
        }

        $productId = null;
        $planCardId = null;
        $boxes = 0;
        $boxPrice = 0;

        if ($request->product_uuid) {
            $product = Product::where('uuid', $request->product_uuid)
                ->where(function ($query) {
                    $query->where('is_layaway', true)
                          ->orWhere('available_for_layaway', true);
                })
                ->firstOrFail();

            $productId = $product->id;
            $boxes = $product->layaway_boxes ?? $product->layaway_total_boxes;
            $boxPrice = $product->layaway_box_price ?? ($product->price / $boxes);

            if (!$boxes || $boxes <= 0) {
                return response()->json(['message' => 'This product is missing layaway box configuration.'], 400);
            }
        } else {
            $planCard = LayawayPlanCard::where('uuid', $request->plan_card_uuid)
                ->where('status', 'active')
                ->firstOrFail();
                
            $planCardId = $planCard->id;
            $boxes = $planCard->number_of_boxes;
            $boxPrice = $planCard->price_per_box;
        }

        $card = LayawayCard::create([
            'uuid' => Str::uuid()->toString(),
            'user_id' => auth()->id(),
            'product_id' => $productId,
            'layaway_plan_card_id' => $planCardId,
            'total_boxes' => $boxes,
            'box_price' => $boxPrice,
            'status' => 'active',
            'pickup_point' => $request->pickup_point,
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
            ->with(['product:id,uuid,name', 'product.images', 'layawayPlanCard', 'payments' => function($q) {
                $q->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        $totalPaid = $card->payments->sum('amount');
        $boxesChecked = $card->payments->sum('boxes_covered');
        $totalAmount = $card->total_boxes * $card->box_price;

        $productName = $card->product ? $card->product->name : ($card->layawayPlanCard ? $card->layawayPlanCard->name : 'Unknown');

        return response()->json([
            'data' => [
                'uuid' => $card->uuid,
                'product_name' => $productName,
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
            'amount' => 'required|numeric|min:1',
        ]);

        $card = LayawayCard::where('uuid', $uuid)
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->firstOrFail();

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

        $paymentData = app(\App\Services\PaymentService::class)->initiate([
            'payable_type' => LayawayCard::class,
            'payable_id'   => $card->id,
            'user_id'      => $request->user()->id,
            'email'        => $request->user()->email,
            'amount'       => $amount,
            'method'       => \App\Enums\PaymentMethod::Paystack,
        ]);

        return response()->json([
            'message' => 'Payment initiated successfully.',
            'payment' => $paymentData,
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
