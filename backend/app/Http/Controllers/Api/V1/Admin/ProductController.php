<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Repositories\ProductRepository;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductRepository $productRepo,
        private ProductService    $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [];
        if ($request->has('available_for_trade')) {
            $filters['available_for_trade'] = filter_var($request->query('available_for_trade'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_preorder')) {
            $filters['is_preorder'] = filter_var($request->query('is_preorder'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('available_for_preorder')) {
            $filters['available_for_preorder'] = filter_var($request->query('available_for_preorder'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('available_for_layaway')) {
            $filters['available_for_layaway'] = filter_var($request->query('available_for_layaway'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('available_for_hire_purchase')) {
            $filters['available_for_hire_purchase'] = filter_var($request->query('available_for_hire_purchase'), FILTER_VALIDATE_BOOLEAN);
        }

        $products = $this->productRepo->getAdminProducts(
            $request->input('per_page', 15),
            $filters,
            ['category', 'brand', 'variations.options', 'images']
        );

        return response()->json([
            'data' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Product created successfully.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    public function show(string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid, ['category', 'brand', 'images', 'variations.options']);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function update(UpdateProductRequest $request, string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid);

        $product = $this->productService->update($product, $request->validated());

        return response()->json([
            'message' => 'Product updated successfully.',
            'data'    => new ProductResource($product),
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid);

        $this->productService->delete($product);

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}
