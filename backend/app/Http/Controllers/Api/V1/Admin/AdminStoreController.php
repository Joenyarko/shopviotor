<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Enums\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::with(['user'])
            ->withCount(['products' => fn($q) => $q->where('status', 'active')])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $stores = $query->paginate($request->input('per_page', 20));

        $data = collect($stores->items())->map(fn($s) => [
            'uuid'             => $s->uuid,
            'name'             => $s->name,
            'slug'             => $s->slug,
            'status'           => $s->status,
            'commission_rate'  => (float) $s->commission_rate,
            'products_count'   => $s->products_count ?? 0,
            'logo_url'         => $s->logo_url,
            'banner_url'       => $s->banner_url,
            'description'      => $s->description,
            'phone'            => $s->phone,
            'location'         => $s->location,
            'approved_at'      => $s->approved_at?->toISOString(),
            'created_at'       => $s->created_at->toISOString(),
            'owner'            => [
                'uuid'  => $s->user?->uuid,
                'name'  => $s->user?->full_name,
                'email' => $s->user?->email,
                'phone' => $s->user?->phone,
            ],
        ]);

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page'    => $stores->lastPage(),
                'total'        => $stores->total(),
            ],
        ]);
    }

    /**
     * Approve a pending store application.
     */
    public function approve(string $uuid): JsonResponse
    {
        $store = Store::where('uuid', $uuid)->with('user')->firstOrFail();

        $store->update([
            'status'      => 'active',
            'approved_at' => now(),
        ]);

        // Upgrade user role to vendor only if they are a regular customer
        if ($store->user->role === UserRole::Customer->value) {
            $store->user->update(['role' => UserRole::Vendor->value]);
        }

        return response()->json(['message' => 'Store approved and vendor role granted.']);
    }

    /**
     * Suspend an active store.
     */
    public function suspend(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $store = Store::where('uuid', $uuid)->firstOrFail();

        $store->update([
            'status'       => 'suspended',
            'suspended_at' => now(),
        ]);

        return response()->json(['message' => 'Store suspended.']);
    }

    /**
     * Reactivate a suspended store.
     */
    public function restore(string $uuid): JsonResponse
    {
        $store = Store::where('uuid', $uuid)->firstOrFail();

        $store->update([
            'status'       => 'active',
            'suspended_at' => null,
        ]);

        return response()->json(['message' => 'Store restored and reactivated.']);
    }

    /**
     * Update commission rate for a store.
     */
    public function updateCommission(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['commission_rate' => 'required|numeric|min:0|max:100']);

        $store = Store::where('uuid', $uuid)->firstOrFail();
        $store->update(['commission_rate' => $request->commission_rate]);

        return response()->json(['message' => 'Commission rate updated.', 'commission_rate' => $request->commission_rate]);
    }
}
