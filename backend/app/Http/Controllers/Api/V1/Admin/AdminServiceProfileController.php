<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceProfileController extends Controller
{
    /**
     * List all service profiles (Buy ATU) for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ServiceProfile::with(['user:id,uuid,first_name,last_name,email', 'images'])
            ->withTrashed() // include soft-deleted ones
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            if ($request->status === 'deleted') {
                $query->onlyTrashed();
            } elseif ($request->status === 'active') {
                $query->whereNull('deleted_at')->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->whereNull('deleted_at')->where('is_active', false);
            }
        }

        $paginated = $query->paginate($request->input('per_page', 20));

        $data = $paginated->getCollection()->map(fn($p) => [
            'id'            => $p->id,
            'uuid'          => $p->uuid,
            'business_name' => $p->business_name,
            'category'      => $p->category,
            'location'      => $p->location,
            'city'          => $p->city,
            'is_active'     => (bool) $p->is_active,
            'is_verified'   => (bool) $p->is_verified,
            'deleted_at'    => $p->deleted_at ? $p->deleted_at->toIso8601String() : null,
            'created_at'    => $p->created_at ? $p->created_at->toIso8601String() : null,
            'images_count'  => $p->images ? $p->images->count() : 0,
            'owner'         => [
                'uuid'  => $p->user?->uuid,
                'name'  => trim(($p->user?->first_name ?? '') . ' ' . ($p->user?->last_name ?? '')),
                'email' => $p->user?->email,
            ],
        ])->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * Soft-delete a service profile. The user can recreate it anytime.
     */
    public function destroy(string $uuid): JsonResponse
    {
        $profile = ServiceProfile::withTrashed()->where('uuid', $uuid)->firstOrFail();

        if ($profile->trashed()) {
            return response()->json(['message' => 'Service profile already deleted.'], 409);
        }

        $profile->delete(); // soft delete

        return response()->json(['message' => 'Service profile deleted. The owner can create a new one at any time.']);
    }

    /**
     * Restore a soft-deleted service profile.
     */
    public function restore(string $uuid): JsonResponse
    {
        $profile = ServiceProfile::onlyTrashed()->where('uuid', $uuid)->firstOrFail();
        $profile->restore();

        return response()->json(['message' => 'Service profile restored successfully.']);
    }

    /**
     * Toggle active/inactive status of a profile.
     */
    public function toggleStatus(string $uuid): JsonResponse
    {
        $profile = ServiceProfile::where('uuid', $uuid)->firstOrFail();
        $profile->update(['is_active' => !$profile->is_active]);

        return response()->json([
            'message'   => 'Status updated.',
            'is_active' => $profile->is_active,
        ]);
    }
}
