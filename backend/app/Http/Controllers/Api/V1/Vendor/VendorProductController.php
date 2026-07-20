<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VendorProductController extends Controller
{
    private function getStore()
    {
        return auth()->user()->store;
    }

    public function index(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) return response()->json(['message' => 'You do not have an active store.'], 403);

        $products = Product::where('store_id', $store->id)
            ->with('images', 'category')
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $store = $this->getStore();
        if (!$store || $store->status !== 'active') {
            return response()->json(['message' => 'Your store must be active to post products.'], 403);
        }

        $request->validate([
            'name'          => 'required|string|max:255',
            'price'         => 'required|numeric|min:0',
            'description'   => 'nullable|string',
            'stock_quantity' => 'required|integer|min:0',
            'condition'     => 'required|in:new,used,refurbished',
            'category_id'   => 'required|string',
            'images'        => 'nullable|array|max:5',
            'images.*'      => 'image|max:4096',
        ]);

        // Resolve category UUID to ID
        $category = Category::where('uuid', $request->category_id)
            ->orWhere('id', $request->category_id)
            ->first();

        $product = Product::create([
            'user_id'        => auth()->id(),
            'store_id'       => $store->id,
            'name'           => $request->name,
            'slug'           => Str::slug($request->name) . '-' . Str::random(6),
            'price'          => $request->price,
            'compare_price'  => $request->compare_price,
            'description'    => $request->description,
            'stock_quantity' => $request->stock_quantity,
            'condition'      => $request->condition,
            'category_id'    => $category?->id,
            'status'         => 'active', // Vendor products go live immediately
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $idx => $imageFile) {
                $path = $imageFile->store("products/{$product->id}", 'public');
                $product->images()->create([
                    'path'       => $path,
                    'is_primary' => $idx === 0,
                    'sort_order' => $idx,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully.',
            'data'    => $product->load('images', 'category'),
        ], 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $store = $this->getStore();
        if (!$store) return response()->json(['message' => 'No active store found.'], 403);

        $product = Product::where('uuid', $uuid)
            ->where('store_id', $store->id)
            ->firstOrFail();

        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'price'          => 'sometimes|numeric|min:0',
            'description'    => 'nullable|string',
            'stock_quantity' => 'sometimes|integer|min:0',
            'condition'      => 'sometimes|in:new,used,refurbished',
        ]);

        $product->update($request->only(['name', 'price', 'compare_price', 'description', 'stock_quantity', 'condition']));

        // Handle new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $idx => $imageFile) {
                $path = $imageFile->store("products/{$product->id}", 'public');
                $product->images()->create([
                    'path'       => $path,
                    'is_primary' => $idx === 0 && $product->images()->count() === 0,
                    'sort_order' => $product->images()->count() + $idx,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully.',
            'data'    => $product->load('images', 'category'),
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $store = $this->getStore();
        $product = Product::where('uuid', $uuid)->where('store_id', $store->id)->firstOrFail();
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }
}
