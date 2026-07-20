<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Layaway;
use App\Enums\LayawayStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLayawayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Layaway::with(['user', 'product.images'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $layaways = $query->paginate($request->input('per_page', 20));

        $data = collect($layaways->items())->map(fn($l) => $this->formatLayaway($l));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $layaways->currentPage(),
                'last_page'    => $layaways->lastPage(),
                'total'        => $layaways->total(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $layaway = Layaway::where('uuid', $uuid)
            ->with(['user', 'product.images', 'payments'])
            ->firstOrFail();

        return response()->json(['data' => $this->formatLayaway($layaway, true)]);
    }

    /**
     * Release/deliver the product — marks layaway as completed by admin.
     */
    public function release(string $uuid): JsonResponse
    {
        $layaway = Layaway::where('uuid', $uuid)->firstOrFail();

        if ($layaway->balance_remaining > 0) {
            return response()->json(['message' => 'Cannot release: balance has not been fully paid.'], 422);
        }

        $layaway->update([
            'status'       => LayawayStatus::Completed->value,
            'completed_at' => now(),
        ]);

        return response()->json(['message' => 'Layaway marked as released and delivered.']);
    }

    /**
     * Cancel a layaway plan (admin action).
     */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $layaway = Layaway::where('uuid', $uuid)->firstOrFail();

        $layaway->update([
            'status'       => LayawayStatus::Cancelled->value,
            'cancelled_at' => now(),
            'notes'        => $request->reason ?? $layaway->notes,
        ]);

        return response()->json(['message' => 'Layaway plan cancelled.']);
    }

    private function formatLayaway(Layaway $layaway, bool $withPayments = false): array
    {
        $data = [
            'uuid'                   => $layaway->uuid,
            'status'                 => $layaway->status instanceof \BackedEnum ? $layaway->status->value : $layaway->status,
            'product_price'          => (float) $layaway->product_price,
            'total_paid'             => (float) $layaway->total_paid,
            'balance_remaining'      => (float) $layaway->balance_remaining,
            'payment_count'          => $layaway->payment_count,
            'progress_percentage'    => $layaway->progress_percentage,
            'target_completion_date' => $layaway->target_completion_date?->toDateString(),
            'completed_at'           => $layaway->completed_at?->toISOString(),
            'notes'                  => $layaway->notes,
            'created_at'             => $layaway->created_at->toISOString(),
            'user'                   => $layaway->user ? [
                'name'  => $layaway->user->full_name,
                'email' => $layaway->user->email,
                'phone' => $layaway->user->phone,
            ] : null,
            'product'                => $layaway->product ? [
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
