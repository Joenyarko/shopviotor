<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\LayawayCard;
use App\Models\LayawayPayment;
use App\Models\Product;
use App\Models\User;
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
        $query = User::whereHas('layawayCards')
            ->with(['layawayCards.product:id,name', 'layawayCards.payments:id,layaway_card_id,amount,boxes_covered']);

        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $formatted = collect($users->items())->map(function ($user) {
            $cards = $user->layawayCards->map(function($card) {
                $totalPaid = $card->payments->sum('amount');
                $boxesChecked = $card->payments->sum('boxes_covered');
                return [
                    'uuid' => $card->uuid,
                    'product_name' => $card->product->name ?? 'N/A',
                    'total_boxes' => $card->total_boxes,
                    'boxes_checked' => (int) $boxesChecked,
                    'amount_paid' => (float) $totalPaid,
                    'amount_remaining' => (float) (($card->total_boxes * $card->box_price) - $totalPaid),
                    'status' => $card->status,
                    'created_at' => $card->created_at->toISOString(),
                ];
            });

            return [
                'id' => $user->id,
                'customer_name' => $user->full_name ?? 'N/A',
                'customer_phone' => $user->phone ?? 'N/A',
                'customer_city' => 'N/A',
                'total_layaways' => $cards->count(),
                'layaways' => $cards
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_uuid' => 'required|exists:products,uuid',
            'user_id' => 'nullable|exists:users,id',
            'first_name' => 'required_without:user_id|string|nullable',
            'last_name' => 'required_without:user_id|string|nullable',
            'phone' => 'required_without:user_id|string|nullable',
            'email' => 'nullable|email',
            'initial_payment' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $product = Product::where('uuid', $request->product_uuid)->firstOrFail();

        $userId = $request->user_id;
        if (!$userId) {
            $user = null;
            if ($request->email) {
                $user = User::where('email', $request->email)->first();
            }
            if (!$user && $request->phone) {
                $user = User::where('phone', $request->phone)->first();
            }
            if (!$user) {
                $email = $request->email ?: 'guest.' . time() . '.' . rand(100, 999) . '@shopviotor.com';
                $user = User::create([
                    'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                    'first_name' => $request->first_name ?: 'Customer',
                    'last_name' => $request->last_name ?: 'Layaway',
                    'phone' => $request->phone,
                    'email' => $email,
                    'password' => bcrypt(\Illuminate\Support\Str::random(12)),
                    'role' => 'customer',
                ]);
            }
            $userId = $user->id;
        }

        $boxes = $product->layaway_boxes ?? $product->layaway_total_boxes;
        if (!$boxes || $boxes <= 0) {
            $boxes = 10;
        }

        $boxPrice = $product->layaway_box_price ?? ($product->price / $boxes);

        $card = DB::transaction(function () use ($userId, $product, $boxes, $boxPrice, $request) {
            $card = LayawayCard::create([
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'user_id' => $userId,
                'product_id' => $product->id,
                'total_boxes' => $boxes,
                'box_price' => $boxPrice,
                'status' => 'active',
            ]);

            if ($request->initial_payment > 0) {
                $amount = (float) $request->initial_payment;
                $boxesCovered = (int) round($amount / $boxPrice);
                if ($boxesCovered <= 0) $boxesCovered = 1;

                $card->payments()->create([
                    'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                    'amount' => $amount,
                    'boxes_covered' => $boxesCovered,
                    'payment_method' => $request->payment_method ?: 'cash',
                    'reference' => 'ADMIN-INIT-' . strtoupper(uniqid()),
                    'notes' => $request->notes ?: 'Initial deposit / Cash payment',
                    'color_code' => '#eab308',
                ]);

                if ($boxesCovered >= $card->total_boxes) {
                    $card->update(['status' => 'completed']);
                }
            }

            return $card;
        });

        return response()->json([
            'message' => 'Customer layaway plan created successfully.',
            'data' => ['uuid' => $card->uuid]
        ], 201);
    }

    public function sales(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $userQuery = User::whereHas('layawayCards.payments', function($q) use ($request) {
            if ($request->start_date) {
                $q->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->end_date) {
                $q->whereDate('created_at', '<=', $request->end_date);
            }
        });

        if ($request->search) {
            $search = $request->search;
            $userQuery->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%")
                  ->orWhereHas('layawayCards.product', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $users = $userQuery->with([
            'layawayCards.product:id,name',
            'layawayCards.payments' => function($q) use ($request) {
                if ($request->start_date) {
                    $q->whereDate('created_at', '>=', $request->start_date);
                }
                if ($request->end_date) {
                    $q->whereDate('created_at', '<=', $request->end_date);
                }
                $q->orderBy('created_at', 'desc');
            }
        ])->paginate($perPage);

        $formatted = collect($users->items())->map(function($user) {
            $allPayments = collect();
            foreach ($user->layawayCards as $card) {
                foreach ($card->payments as $payment) {
                    $allPayments->push([
                        'uuid' => $payment->uuid,
                        'amount' => (float) $payment->amount,
                        'boxes_covered' => $payment->boxes_covered,
                        'payment_method' => $payment->payment_method,
                        'reference' => $payment->reference,
                        'product_name' => $card->product->name ?? 'Unknown Product',
                        'created_at' => $payment->created_at->toISOString(),
                    ]);
                }
            }

            $allPayments = $allPayments->sortByDesc('created_at')->values();
            $uniqueProducts = $allPayments->pluck('product_name')->unique()->values()->implode(', ');

            return [
                'customer_uuid' => $user->uuid,
                'customer_name' => $user->full_name ?? trim($user->first_name . ' ' . $user->last_name),
                'customer_email' => $user->email,
                'customer_phone' => $user->phone_number ?? '—',
                'products_list' => $uniqueProducts ?: '—',
                'total_amount' => (float) $allPayments->sum('amount'),
                'total_boxes' => (int) $allPayments->sum('boxes_covered'),
                'payments_count' => (int) $allPayments->count(),
                'latest_payment_date' => $allPayments->first()['created_at'] ?? null,
                'payments' => $allPayments,
            ];
        })->filter(function($item) {
            return $item['payments_count'] > 0;
        })->values();

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,uuid,name', 'images']);
        
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->status !== 'all') {
            $query->where(function($q) {
                $q->where('is_layaway', true)->orWhere('available_for_layaway', true);
            });
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        $formatted = collect($products->items())->map(function($product) {
            return [
                'id' => $product->id,
                'uuid' => $product->uuid,
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => $product->stock_quantity,
                'is_layaway' => (bool) ($product->is_layaway || $product->available_for_layaway),
                'description' => $product->description,
                'category_id' => $product->category_id,
                'category' => $product->category ? ['id' => $product->category->id, 'uuid' => $product->category->uuid, 'name' => $product->category->name] : null,
                'layaway_boxes' => $product->layaway_boxes ?? $product->layaway_total_boxes ?? 10,
                'primary_image' => $product->images->where('is_primary', true)->first()->image_url ?? ($product->images->first()->image_url ?? null),
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
