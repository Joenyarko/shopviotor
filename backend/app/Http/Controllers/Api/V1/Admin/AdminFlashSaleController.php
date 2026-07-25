<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFlashSaleController extends Controller
{
    public function index(): JsonResponse
    {
        $flashSales = FlashSale::with('products')->latest()->get();
        return response()->json(['data' => $flashSales]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'header_color' => 'nullable|string|in:yellow,black',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,uuid',
            'products.*.flash_price' => 'required|numeric|min:0',
            'products.*.stock_allocated' => 'required|integer|min:1',
        ]);

        $flashSale = FlashSale::create([
            'title' => $validated['title'],
            'header_color' => $validated['header_color'] ?? 'yellow',
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        if (!empty($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $productData) {
                $productModel = \App\Models\Product::where('uuid', $productData['id'])->first();
                if ($productModel) {
                    $syncData[$productModel->id] = [
                        'flash_price' => $productData['flash_price'],
                        'stock_allocated' => $productData['stock_allocated'],
                        'stock_sold' => 0,
                    ];
                }
            }
            $flashSale->products()->sync($syncData);
        }

        return response()->json([
            'message' => 'Flash sale created successfully',
            'data' => $flashSale->load('products')
        ], 201);
    }

    public function update(Request $request, $uuid): JsonResponse
    {
        $flashSale = FlashSale::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'header_color' => 'nullable|string|in:yellow,black',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,uuid',
            'products.*.flash_price' => 'required|numeric|min:0',
            'products.*.stock_allocated' => 'required|integer|min:1',
        ]);

        $flashSale->update([
            'title' => $validated['title'],
            'header_color' => $validated['header_color'] ?? 'yellow',
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        if (isset($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $productData) {
                $productModel = \App\Models\Product::where('uuid', $productData['id'])->first();
                if ($productModel) {
                    $syncData[$productModel->id] = [
                        'flash_price' => $productData['flash_price'],
                        'stock_allocated' => $productData['stock_allocated'],
                    ];
                }
            }
            $flashSale->products()->sync($syncData);
        }

        return response()->json([
            'message' => 'Flash sale updated successfully',
            'data' => $flashSale->load('products')
        ]);
    }

    public function destroy($uuid): JsonResponse
    {
        $flashSale = FlashSale::where('uuid', $uuid)->firstOrFail();
        $flashSale->delete();

        return response()->json([
            'message' => 'Flash sale deleted successfully'
        ]);
    }
}
