<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::orderBy('name')->get();
        return response()->json(['data' => BrandResource::collection($brands)->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
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

        Cache::forget('brands.all');

        return response()->json(['data' => (new BrandResource($brand))->resolve()], 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return response()->json(['data' => (new BrandResource($brand))->resolve()]);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
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

        Cache::forget('brands.all');
        Cache::forget("brands.{$brand->slug}");

        return response()->json(['data' => (new BrandResource($brand))->resolve()]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->getRawOriginal('logo')) {
            Storage::disk('public')->delete($brand->getRawOriginal('logo'));
        }
        
        Cache::forget('brands.all');
        Cache::forget("brands.{$brand->slug}");
        
        $brand->delete();
        return response()->json(null, 204);
    }
}
