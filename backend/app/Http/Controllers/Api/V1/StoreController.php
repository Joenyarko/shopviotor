<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Enums\UserRole;

class StoreController extends Controller
{
    /**
     * List all active stores (public).
     */
    public function index(Request $request): JsonResponse
    {
        $stores = Store::active()
            ->with('user')
            ->withCount(['products' => fn($q) => $q->where('status', 'active')])
            ->latest('approved_at')
            ->paginate($request->input('per_page', 16));

        $data = collect($stores->items())->map(fn($s) => $this->formatStore($s));

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
     * Get a store by slug (public).
     */
    public function show(string $slug): JsonResponse
    {
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->with('user')
            ->withCount(['products' => fn($q) => $q->where('status', 'active')->where('is_layaway', false)])
            ->firstOrFail();

        $products = Product::where('store_id', $store->id)
            ->where('status', 'active')
            ->where('is_layaway', false)
            ->with('images', 'category')
            ->latest()
            ->paginate(20);

        return response()->json([
            'store'    => $this->formatStore($store),
            'products' => \App\Http\Resources\ProductResource::collection($products->items()),
            'meta'     => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Apply to become a vendor / create a store (authenticated).
     */
    public function apply(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Already has a store
        if ($user->store) {
            return response()->json([
                'message' => 'You already have a store registered.',
                'store'   => $this->formatStore($user->store),
            ], 422);
        }

        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'phone'       => 'nullable|string|max:30',
            'whatsapp'    => 'nullable|string|max:30',
            'location'    => 'nullable|string|max:200',
            'logo'        => 'nullable|image|max:2048',
            'banner'      => 'nullable|image|max:4096',
            'banners'     => 'nullable|array|max:5',
            'banners.*'   => 'image|max:4096',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;
        while (Store::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $logoPath   = $request->hasFile('logo')   ? $request->file('logo')->storeOnCloudinary('stores/logos')->getSecurePath()     : null;
        $bannerPath = $request->hasFile('banner')  ? $request->file('banner')->storeOnCloudinary('stores/banners')->getSecurePath() : null;

        $bannersPaths = [];
        if ($request->hasFile('banners')) {
            foreach ($request->file('banners') as $file) {
                $bannersPaths[] = $file->storeOnCloudinary('stores/banners')->getSecurePath();
            }
        }

        $store = Store::create([
            'user_id'     => $user->id,
            'name'        => $request->name,
            'slug'        => $slug,
            'description' => $request->description,
            'phone'       => $request->phone,
            'whatsapp'    => $request->whatsapp,
            'location'    => $request->location,
            'logo'        => $logoPath,
            'banner'      => $bannerPath,
            'banners'     => !empty($bannersPaths) ? $bannersPaths : null,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Store application submitted! We will review and activate it shortly.',
            'store'   => $this->formatStore($store),
        ], 201);
    }

    /**
     * Get the authenticated user's own store details.
     */
    public function myStore(): JsonResponse
    {
        $user = auth()->user();
        $store = $user->store;

        if (!$store) {
            return response()->json(['message' => 'You do not have a store yet.'], 404);
        }

        $store->loadCount(['products' => fn($q) => $q->where('status', 'active')]);

        return response()->json(['data' => $this->formatStore($store, true)]);
    }

    /**
     * Update store settings (vendor only).
     */
    public function update(Request $request): JsonResponse
    {
        $user = auth()->user();
        $store = $user->store;

        if (!$store) {
            return response()->json(['message' => 'You do not have a store.'], 404);
        }

        $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:1000',
            'phone'       => 'nullable|string|max:30',
            'whatsapp'    => 'nullable|string|max:30',
            'location'    => 'nullable|string|max:200',
            'logo'        => 'nullable|image|max:2048',
            'banner'      => 'nullable|image|max:4096',
            'banners'     => 'nullable|array|max:5',
            'banners.*'   => 'image|max:4096',
            'removed_banners' => 'nullable|array',
            'removed_banners.*' => 'string',
        ]);

        if ($request->hasFile('logo')) {
            $store->logo = $request->file('logo')->storeOnCloudinary('stores/logos')->getSecurePath();
        }
        if ($request->hasFile('banner')) {
            $store->banner = $request->file('banner')->storeOnCloudinary('stores/banners')->getSecurePath();
        }
        
        $currentBanners = $store->banners ?? [];
        if ($request->has('removed_banners')) {
            $removed = $request->input('removed_banners');
            $currentBanners = array_values(array_filter($currentBanners, fn($b) => !in_array(asset('storage/' . $b), $removed) && !in_array($b, $removed)));
        }

        if ($request->hasFile('banners')) {
            foreach ($request->file('banners') as $file) {
                $currentBanners[] = $file->storeOnCloudinary('stores/banners')->getSecurePath();
            }
        }
        $store->banners = !empty($currentBanners) ? $currentBanners : null;

        $store->fill($request->only(['name', 'description', 'phone', 'whatsapp', 'location']));
        $store->save();

        return response()->json([
            'message' => 'Store updated successfully.',
            'data'    => $this->formatStore($store),
        ]);
    }

    private function formatStore(Store $store, bool $detailed = false): array
    {
        $data = [
            'uuid'            => $store->uuid,
            'name'            => $store->name,
            'slug'            => $store->slug,
            'description'     => $store->description,
            'phone'           => $store->phone,
            'whatsapp'        => $store->whatsapp,
            'location'        => $store->location,
            'logo_url'        => $store->logo_url,
            'banner_url'      => $store->banner_url,
            'banners_urls'    => $store->banners_urls,
            'status'                  => $store->status,
            'is_verified'             => (bool) $store->is_verified,
            'commission_rate'         => (float) $store->commission_rate,
            'can_offer_layaway'       => (bool) $store->can_offer_layaway,
            'can_offer_hire_purchase' => (bool) $store->can_offer_hire_purchase,
            'can_offer_preorders'     => (bool) $store->can_offer_preorders,
            'can_offer_trades'        => (bool) $store->can_offer_trades,
            'products_count'          => $store->products_count ?? 0,
            'approved_at'             => $store->approved_at?->toISOString(),
            'created_at'              => $store->created_at->toISOString(),
            'owner'                   => $store->user ? [
                'name' => $store->user->full_name,
            ] : null,
        ];

        return $data;
    }
}
