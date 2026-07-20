<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Layaway;
use App\Models\LayawayPayment;
use App\Models\Product;
use App\Enums\LayawayStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LayawayController extends Controller
{
    /**
     * List all layaway plans for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $layaways = Layaway::where('user_id', auth()->id())
            ->with(['product.images'])
            ->latest()
            ->get()
            ->map(fn($l) => $this->formatLayaway($l));

        return response()->json(['data' => $layaways]);
    }

    /**
     * Start a new layaway plan for a product.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'              => 'required|string',
            'initial_payment'         => 'required|numeric|min:0',
            'target_completion_date'  => 'nullable|date|after:today',
            'notes'                   => 'nullable|string|max:500',
            'customer_phone'          => 'required|string|max:20',
            'customer_address'        => 'required|string|max:1000',
        ]);

        // Resolve product UUID to ID
        $product = Product::where('uuid', $request->product_id)
            ->where('available_for_layaway', true)
            ->where('status', 'active')
            ->firstOrFail();

        // Check if user already has an active layaway for this product
        $existing = Layaway::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->whereIn('status', [LayawayStatus::Active->value])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have an active layaway plan for this product.'], 422);
        }

        $productPrice = (float) $product->price;
        $initialPayment = (float) $request->initial_payment;

        if ($initialPayment > $productPrice) {
            return response()->json(['message' => 'Initial payment cannot exceed the product price.'], 422);
        }

        $balanceRemaining = $productPrice - $initialPayment;

        $layaway = DB::transaction(function () use ($product, $productPrice, $initialPayment, $balanceRemaining, $request) {
            $layaway = Layaway::create([
                'user_id'                => auth()->id(),
                'product_id'             => $product->id,
                'status'                 => LayawayStatus::Active->value,
                'product_price'          => $productPrice,
                'total_paid'             => $initialPayment,
                'balance_remaining'      => $balanceRemaining,
                'payment_count'          => $initialPayment > 0 ? 1 : 0,
                'target_completion_date' => $request->target_completion_date,
                'notes'                  => $request->notes,
                'customer_phone'         => $request->customer_phone,
                'customer_address'       => $request->customer_address,
            ]);

            // Record the initial payment if there is one
            if ($initialPayment > 0) {
                $layaway->payments()->create([
                    'amount'             => $initialPayment,
                    'payment_reference'  => 'INITIAL-' . strtoupper(uniqid()),
                    'method'             => 'manual',
                    'paid_at'            => now(),
                    'notes'              => 'Initial payment / first contribution',
                ]);
            }

            return $layaway;
        });

        return response()->json([
            'message' => 'Layaway plan created successfully.',
            'data'    => $this->formatLayaway($layaway->load('product.images', 'payments')),
        ], 201);
    }

    /**
     * Get a specific layaway plan with payment history.
     */
    public function show(string $uuid): JsonResponse
    {
        $layaway = Layaway::where('uuid', $uuid)
            ->where('user_id', auth()->id())
            ->with(['product.images', 'payments'])
            ->firstOrFail();

        return response()->json(['data' => $this->formatLayaway($layaway, true)]);
    }

    /**
     * Make a payment contribution to a layaway plan.
     */
    public function pay(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'amount'    => 'required|numeric|min:1',
            'notes'     => 'nullable|string|max:255',
        ]);

        $layaway = Layaway::where('uuid', $uuid)
            ->where('user_id', auth()->id())
            ->where('status', LayawayStatus::Active->value)
            ->firstOrFail();

        $amount = (float) $request->amount;

        if ($amount > (float) $layaway->balance_remaining) {
            $amount = (float) $layaway->balance_remaining; // Cap at remaining balance
        }

        DB::transaction(function () use ($layaway, $amount, $request) {
            $newTotalPaid = (float) $layaway->total_paid + $amount;
            $newBalance   = max(0, (float) $layaway->product_price - $newTotalPaid);
            $isCompleted  = $newBalance <= 0;

            $layaway->payments()->create([
                'amount'            => $amount,
                'payment_reference' => 'LAY-' . strtoupper(uniqid()),
                'method'            => 'manual',
                'paid_at'           => now(),
                'notes'             => $request->notes,
            ]);

            $layaway->update([
                'total_paid'       => $newTotalPaid,
                'balance_remaining' => $newBalance,
                'payment_count'    => $layaway->payment_count + 1,
                'status'           => $isCompleted ? LayawayStatus::Completed->value : LayawayStatus::Active->value,
                'completed_at'     => $isCompleted ? now() : null,
            ]);
        });

        $layaway->refresh()->load('product.images', 'payments');

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'data'    => $this->formatLayaway($layaway, true),
        ]);
    }

    /**
     * Format a layaway model for API response.
     */
    private function formatLayaway(Layaway $layaway, bool $withPayments = false): array
    {
        $data = [
            'uuid'                    => $layaway->uuid,
            'status'                  => $layaway->status instanceof \BackedEnum ? $layaway->status->value : $layaway->status,
            'product_price'           => (float) $layaway->product_price,
            'total_paid'              => (float) $layaway->total_paid,
            'balance_remaining'       => (float) $layaway->balance_remaining,
            'payment_count'           => $layaway->payment_count,
            'progress_percentage'     => $layaway->progress_percentage,
            'target_completion_date'  => $layaway->target_completion_date?->toDateString(),
            'completed_at'            => $layaway->completed_at?->toISOString(),
            'notes'                   => $layaway->notes,
            'customer_phone'          => $layaway->customer_phone,
            'customer_address'        => $layaway->customer_address,
            'created_at'              => $layaway->created_at->toISOString(),
            'product'                 => $layaway->product ? [
                'uuid'          => $layaway->product->uuid,
                'name'          => $layaway->product->name,
                'price'         => (float) $layaway->product->price,
                'primary_image' => $layaway->product->primary_image,
            ] : null,
        ];

        if ($withPayments && $layaway->relationLoaded('payments')) {
            $data['payments'] = $layaway->payments->map(fn($p) => [
                'id'                => $p->id,
                'amount'            => (float) $p->amount,
                'payment_reference' => $p->payment_reference,
                'method'            => $p->method,
                'notes'             => $p->notes,
                'paid_at'           => $p->paid_at?->toISOString() ?? $p->created_at->toISOString(),
            ])->values();
        }

        return $data;
    }
}
