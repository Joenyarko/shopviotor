<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories.tree', 86400, function () {
            return Category::whereNull('parent_id')
                ->with('children.children')
                ->orderBy('sort_order')
                ->get();
        });

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Cache::remember("categories.{$slug}", 86400, function () use ($slug) {
            return Category::where('slug', $slug)->with('children')->firstOrFail();
        });

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }
}
