<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductRepository $productRepo) {}

    public function index(Request $request): JsonResponse
    {
        $products = $this->productRepo->getActive(
            $request->input('per_page', 15),
            $request->only(['category_id', 'brand_id', 'min_price', 'max_price', 'condition', 'city', 'sort', 'available_for_preorder', 'available_for_layaway', 'available_for_hire_purchase', 'available_for_trade'])
        );

        return response()->json([
            'data' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid, ['category', 'brand', 'images', 'reviews.user', 'store', 'variations.options']);

        if ($product->status->value !== 'active') {
            abort(404, 'Product not found or inactive.');
        }

        $this->productRepo->incrementViews($product);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $term = $request->input('q');

        if (!$term) {
            return response()->json(['data' => []]);
        }

        $products = $this->productRepo->search($term, $request->input('per_page', 15));

        return response()->json([
            'data' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    public function featured(): JsonResponse
    {
        $products = $this->productRepo->getFeatured();

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }
}
