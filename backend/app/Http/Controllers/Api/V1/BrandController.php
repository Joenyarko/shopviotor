<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::active()->orderBy('name')->get();

        return response()->json([
            'data' => BrandResource::collection($brands),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $brand = Brand::where('slug', $slug)->active()->firstOrFail();

        return response()->json([
            'data' => new BrandResource($brand),
        ]);
    }
}
