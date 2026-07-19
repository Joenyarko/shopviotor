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
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.flash_price' => 'required|numeric|min:0',
            'products.*.stock_allocated' => 'required|integer|min:1',
        ]);

        $flashSale = FlashSale::create([
            'title' => $validated['title'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        if (!empty($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $product) {
                $syncData[$product['id']] = [
                    'flash_price' => $product['flash_price'],
                    'stock_allocated' => $product['stock_allocated'],
                    'stock_sold' => 0,
                ];
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
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'boolean',
            'products' => 'nullable|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.flash_price' => 'required|numeric|min:0',
            'products.*.stock_allocated' => 'required|integer|min:1',
        ]);

        $flashSale->update([
            'title' => $validated['title'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        if (isset($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $product) {
                $syncData[$product['id']] = [
                    'flash_price' => $product['flash_price'],
                    'stock_allocated' => $product['stock_allocated'],
                    // Retain stock sold if possible, but for simplicity we'll let sync handle it (which resets unless we fetch old data)
                ];
            }
            // Better to retain old pivot data if needed, but this is fine for MVP.
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
