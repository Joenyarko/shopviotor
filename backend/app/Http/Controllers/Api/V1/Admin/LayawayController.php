<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\LayawayCard;
use App\Models\LayawayPayment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class LayawayController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalRevenue = LayawayPayment::sum('amount');
        $totalCustomers = LayawayCard::distinct('user_id')->count('user_id');
        $activePlans = LayawayCard::where('status', 'active')->count();
        $completedPlans = LayawayCard::where('status', 'completed')->count();
        
        $defaultingPlans = LayawayCard::where('status', 'active')
            ->whereDoesntHave('payments', function($q) {
                $q->where('created_at', '>=', now()->subDays(30));
            })->count();

        return response()->json([
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'total_customers' => $totalCustomers,
                'active_plans' => $activePlans,
                'completed_plans' => $completedPlans,
                'defaulting_plans' => $defaultingPlans
            ]
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = LayawayCard::with(['user:id,first_name,last_name,phone', 'product:id,name,price']);

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 10);
        $cards = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $formatted = collect($cards->items())->map(function ($card) {
            $totalPaid = $card->payments()->sum('amount');
            $boxesChecked = $card->payments()->sum('boxes_covered');

            return [
                'uuid' => $card->uuid,
                'customer_name' => $card->user->full_name ?? 'N/A',
                'customer_phone' => $card->user->phone ?? 'N/A',
                'customer_city' => 'N/A', // no city field on user
                'product_name' => $card->product->name ?? 'N/A',
                'total_boxes' => $card->total_boxes,
                'boxes_checked' => (int) $boxesChecked,
                'amount_paid' => (float) $totalPaid,
                'amount_remaining' => (float) (($card->total_boxes * $card->box_price) - $totalPaid),
                'status' => $card->status,
                'created_at' => $card->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $cards->currentPage(),
                'last_page' => $cards->lastPage(),
                'total' => $cards->total(),
            ]
        ]);
    }

    public function sales(Request $request): JsonResponse
    {
        $query = LayawayPayment::with(['layawayCard.user:id,first_name,last_name', 'layawayCard.product:id,name']);
        
        $perPage = $request->input('per_page', 20);
        $payments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $formatted = collect($payments->items())->map(function($payment) {
            return [
                'uuid' => $payment->uuid,
                'amount' => (float) $payment->amount,
                'boxes_covered' => $payment->boxes_covered,
                'payment_method' => $payment->payment_method,
                'reference' => $payment->reference,
                'customer_name' => $payment->layawayCard->user->full_name ?? 'Unknown',
                'product_name' => $payment->layawayCard->product->name ?? 'Unknown',
                'created_at' => $payment->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ]
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $query = Product::select('id', 'uuid', 'name', 'price', 'stock_quantity', 'available_for_layaway', 'is_layaway');
        
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->status === 'layaway') {
            $query->where(function($q) {
                $q->where('is_layaway', true)->orWhere('available_for_layaway', true);
            });
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        $formatted = collect($products->items())->map(function($product) {
            return [
                'uuid' => $product->uuid,
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => $product->stock_quantity,
                'is_layaway' => (bool) ($product->is_layaway || $product->available_for_layaway)
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    public function toggleInventory(Request $request, string $uuid): JsonResponse
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();
        
        $currentStatus = $product->is_layaway || $product->available_for_layaway;
        $newStatus = !$currentStatus;

        $product->update([
            'is_layaway' => $newStatus,
            'available_for_layaway' => $newStatus
        ]);

        return response()->json([
            'message' => 'Product layaway status updated',
            'is_layaway' => $newStatus
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $card = LayawayCard::where('uuid', $uuid)
            ->with(['user:id,first_name,last_name,phone', 'product:id,uuid,name', 'product.images', 'payments' => function($q) {
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
                'customer_name' => $card->user->full_name ?? 'N/A',
                'customer_phone' => $card->user->phone ?? 'N/A',
                'customer_city' => 'N/A',
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

    public function reversePayment(string $uuid, string $paymentUuid): JsonResponse
    {
        $card = LayawayCard::where('uuid', $uuid)->firstOrFail();
        $payment = LayawayPayment::where('uuid', $paymentUuid)->where('layaway_card_id', $card->id)->firstOrFail();

        DB::transaction(function () use ($card, $payment) {
            $payment->delete();

            $currentBoxes = $card->payments()->sum('boxes_covered');
            if ($currentBoxes < $card->total_boxes && $card->status === 'completed') {
                $card->update(['status' => 'active']);
            }
        });

        return response()->json(['message' => 'Payment reversed successfully.']);
    }
}
