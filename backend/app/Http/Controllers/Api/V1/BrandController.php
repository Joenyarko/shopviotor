<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Cache::remember('brands.all', 86400, function () {
            return Brand::active()->orderBy('name')->get();
        });

        return response()->json([
            'data' => BrandResource::collection($brands),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $brand = Cache::remember("brands.{$slug}", 86400, function () use ($slug) {
            return Brand::where('slug', $slug)->active()->firstOrFail();
        });

        return response()->json([
            'data' => new BrandResource($brand),
        ]);
    }
}
