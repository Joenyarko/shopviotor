<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::orderBy('name')->get();
        return response()->json(['data' => $brands]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['uuid'] = Str::uuid()->toString();
        $validated['is_active'] = $validated['is_active'] ?? true;

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('brands', 'public');
        } else {
            unset($validated['logo']); // Don't try to store string if empty or null from JS
        }

        $brand = Brand::create($validated);

        return response()->json(['data' => $brand], 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return response()->json(['data' => $brand]);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('logo')) {
            if ($brand->getRawOriginal('logo')) {
                Storage::disk('public')->delete($brand->getRawOriginal('logo'));
            }
            $validated['logo'] = $request->file('logo')->store('brands', 'public');
        } else {
            // Remove it from validated so it doesn't overwrite existing logo with null if no new file is provided
            unset($validated['logo']); 
            
            // Note: If user explicitly wants to delete the logo, we'd need a separate field like 'remove_logo'
        }

        $brand->update($validated);

        return response()->json(['data' => $brand]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->getRawOriginal('logo')) {
            Storage::disk('public')->delete($brand->getRawOriginal('logo'));
        }
        $brand->delete();
        return response()->json(null, 204);
    }
}
