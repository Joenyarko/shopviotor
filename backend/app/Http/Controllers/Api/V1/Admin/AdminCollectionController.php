<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::with('products')->orderBy('sort_order')->get();
        return response()->json(['data' => $collections]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'header_color' => 'nullable|string|in:yellow,black',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,uuid',
            'products.*.sort_order' => 'integer',
        ]);

        $collection = Collection::create([
            'title' => $validated['title'],
            'header_color' => $validated['header_color'] ?? 'yellow',
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        if (!empty($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $productData) {
                $productModel = \App\Models\Product::where('uuid', $productData['id'])->first();
                if ($productModel) {
                    $syncData[$productModel->id] = [
                        'sort_order' => $productData['sort_order'] ?? 0,
                    ];
                }
            }
            $collection->products()->sync($syncData);
        }

        return response()->json([
            'message' => 'Collection created successfully',
            'data' => $collection->load('products')
        ], 201);
    }

    public function update(Request $request, $uuid): JsonResponse
    {
        $collection = Collection::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'header_color' => 'nullable|string|in:yellow,black',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,uuid',
            'products.*.sort_order' => 'integer',
        ]);

        $collection->update([
            'title' => $validated['title'],
            'header_color' => $validated['header_color'] ?? 'yellow',
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        if (isset($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $productData) {
                $productModel = \App\Models\Product::where('uuid', $productData['id'])->first();
                if ($productModel) {
                    $syncData[$productModel->id] = [
                        'sort_order' => $productData['sort_order'] ?? 0,
                    ];
                }
            }
            $collection->products()->sync($syncData);
        }

        return response()->json([
            'message' => 'Collection updated successfully',
            'data' => $collection->load('products')
        ]);
    }

    public function destroy($uuid): JsonResponse
    {
        $collection = Collection::where('uuid', $uuid)->firstOrFail();
        $collection->delete();

        return response()->json([
            'message' => 'Collection deleted successfully'
        ]);
    }
}
