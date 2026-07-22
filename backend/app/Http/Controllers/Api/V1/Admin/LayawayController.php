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
        \ = LayawayPayment::sum('amount');
        \ = LayawayCard::distinct('user_id')->count('user_id');
        \ = LayawayCard::where('status', 'active')->count();
        \ = LayawayCard::where('status', 'completed')->count();
        
        // Defaulters: Let's consider defaulting as active plans with no payment in last 30 days
        \ = LayawayCard::where('status', 'active')
            ->whereDoesntHave('payments', function(\) {
                \->where('created_at', '>=', now()->subDays(30));
            })->count();

        return response()->json([
            'data' => [
                'total_revenue' => (float) \,
                'total_customers' => \,
                'active_plans' => \,
                'completed_plans' => \,
                'defaulting_plans' => \
            ]
        ]);
    }

    public function index(Request \): JsonResponse
    {
        \ = LayawayCard::with(['user:id,name,phone,city,address', 'product:id,name,price']);

        if (\->search) {
            \ = \->search;
            \->whereHas('user', function(\) use (\) {
                \->where('name', 'like', "%{\}%")
                  ->orWhere('phone', 'like', "%{\}%")
                  ->orWhere('city', 'like', "%{\}%");
            });
        }

        if (\->status && \->status !== 'all') {
            \->where('status', \->status);
        }

        \ = \->input('per_page', 10);
        \ = \->orderBy('created_at', 'desc')->paginate(\);

        \ = collect(\->items())->map(function (\) {
            \ = \->payments()->sum('amount');
            \ = \->payments()->sum('boxes_covered');

            return [
                'uuid' => \->uuid,
                'customer_name' => \->user->name,
                'customer_phone' => \->user->phone,
                'customer_city' => \->user->city,
                'product_name' => \->product->name,
                'total_boxes' => \->total_boxes,
                'boxes_checked' => (int) \,
                'amount_paid' => (float) \,
                'amount_remaining' => (float) ((\->total_boxes * \->box_price) - \),
                'status' => \->status,
                'created_at' => \->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => \,
            'meta' => [
                'current_page' => \->currentPage(),
                'last_page' => \->lastPage(),
                'total' => \->total(),
            ]
        ]);
    }

    public function sales(Request \): JsonResponse
    {
        \ = LayawayPayment::with(['card.user:id,name', 'card.product:id,name']);
        
        \ = \->input('per_page', 20);
        \ = \->orderBy('created_at', 'desc')->paginate(\);

        \ = collect(\->items())->map(function(\) {
            return [
                'uuid' => \->uuid,
                'amount' => (float) \->amount,
                'boxes_covered' => \->boxes_covered,
                'payment_method' => \->payment_method,
                'reference' => \->reference,
                'customer_name' => \->card->user->name ?? 'Unknown',
                'product_name' => \->card->product->name ?? 'Unknown',
                'created_at' => \->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => \,
            'meta' => [
                'current_page' => \->currentPage(),
                'last_page' => \->lastPage(),
                'total' => \->total(),
            ]
        ]);
    }

    public function inventory(Request \): JsonResponse
    {
        // Simple search for products to toggle layaway
        \ = Product::select('id', 'uuid', 'name', 'price', 'stock_quantity', 'available_for_layaway', 'is_layaway');
        
        if (\->search) {
            \->where('name', 'like', "%{\->search}%");
        }

        if (\->status === 'layaway') {
            \->where(function(\) {
                \->where('is_layaway', true)->orWhere('available_for_layaway', true);
            });
        }

        \ = \->orderBy('created_at', 'desc')->paginate(20);

        \ = collect(\->items())->map(function(\) {
            return [
                'uuid' => \->uuid,
                'name' => \->name,
                'price' => (float) \->price,
                'stock' => \->stock_quantity,
                'is_layaway' => (bool) (\->is_layaway || \->available_for_layaway)
            ];
        });

        return response()->json([
            'data' => \,
            'meta' => [
                'current_page' => \->currentPage(),
                'last_page' => \->lastPage(),
                'total' => \->total(),
            ]
        ]);
    }

    public function toggleInventory(Request \, string \): JsonResponse
    {
        \ = Product::where('uuid', \)->firstOrFail();
        
        \ = \->is_layaway || \->available_for_layaway;
        \ = !\;

        \->update([
            'is_layaway' => \,
            'available_for_layaway' => \
        ]);

        return response()->json([
            'message' => 'Product layaway status updated',
            'is_layaway' => \
        ]);
    }

    public function show(string \): JsonResponse
    {
        \ = LayawayCard::where('uuid', \)
            ->with(['user:id,name,phone,city,address', 'product:id,uuid,name', 'product.images', 'payments' => function(\) {
                \->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        \ = \->payments->sum('amount');
        \ = \->payments->sum('boxes_covered');
        \ = \->total_boxes * \->box_price;

        return response()->json([
            'data' => [
                'uuid' => \->uuid,
                'product_name' => \->product->name,
                'customer_name' => \->user->name,
                'customer_phone' => \->user->phone ?? 'N/A',
                'customer_city' => \->user->city ?? 'N/A',
                'total_boxes' => \->total_boxes,
                'boxes_checked' => (int) \,
                'boxes_remaining' => \->total_boxes - \,
                'box_price' => (float) \->box_price,
                'total_amount' => (float) \,
                'amount_paid' => (float) \,
                'amount_remaining' => (float) \ - \,
                'completion_percentage' => round((\ / \->total_boxes) * 100, 2),
                'status' => \->status,
                'payments' => \->payments->map(function (\) {
                    return [
                        'uuid' => \->uuid,
                        'amount' => (float) \->amount,
                        'boxes_covered' => \->boxes_covered,
                        'payment_method' => \->payment_method,
                        'reference' => \->reference,
                        'notes' => \->notes,
                        'color_code' => \->color_code,
                        'created_at' => \->created_at->toISOString(),
                    ];
                })
            ]
        ]);
    }

    public function storePayment(Request \, string \): JsonResponse
    {
        \->validate([
            'amount_paid' => 'nullable|numeric|min:0',
            'number_of_boxes' => 'nullable|integer|min:0',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        \ = LayawayCard::where('uuid', \)->firstOrFail();

        if (\->status === 'completed') {
            return response()->json(['message' => 'This layaway is already completed.'], 400);
        }

        \ = (float) \->box_price;
        
        // Admin can enter EITHER amount OR boxes
        \ = (float) \->amount_paid;
        \ = (int) \->number_of_boxes;

        if (\ > 0) {
            \ = (int) round(\ / \);
        } else if (\ > 0) {
            \ = \ * \;
        } else {
            return response()->json(['message' => 'Please enter an amount or number of boxes.'], 400);
        }

        \ = \->payments()->sum('boxes_covered');
        \ = \->total_boxes - \;

        if (\ > \) {
            return response()->json([
                'message' => "Payment exceeds remaining boxes. Only {\} boxes left."
            ], 422);
        }

        \ = \->payments()->count();
        \ = (\ % 2 === 0) ? '#eab308' : '#000000'; // Yellow and Black

        DB::transaction(function () use (\, \, \, \, \, \) {
            \->payments()->create([
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'amount' => \,
                'boxes_covered' => \,
                'payment_method' => \->payment_method,
                'reference' => 'ADMIN-' . strtoupper(uniqid()),
                'notes' => \->notes,
                'color_code' => \,
            ]);

            if (\ + \ >= \->total_boxes) {
                \->update(['status' => 'completed']);
            }
        });

        return response()->json([
            'message' => 'Payment recorded successfully.'
        ]);
    }

    public function reversePayment(string \, string \): JsonResponse
    {
        \ = LayawayCard::where('uuid', \)->firstOrFail();
        \ = LayawayPayment::where('uuid', \)->where('layaway_card_id', \->id)->firstOrFail();

        DB::transaction(function () use (\, \) {
            \->delete();

            // Re-evaluate card status
            \ = \->payments()->sum('boxes_covered');
            if (\ < \->total_boxes && \->status === 'completed') {
                \->update(['status' => 'active']);
            }
        });

        return response()->json(['message' => 'Payment reversed successfully.']);
    }
}
