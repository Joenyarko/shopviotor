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
        $filters = $request->only(['category_id', 'brand_id', 'min_price', 'max_price', 'condition', 'city', 'sort', 'available_for_preorder', 'available_for_layaway', 'available_for_hire_purchase', 'available_for_trade']);

        if ($request->user()) {
            $mostViewedCategory = \App\Models\UserProductView::where('user_id', $request->user()->id)
                ->select('category_id')
                ->whereNotNull('category_id')
                ->groupBy('category_id')
                ->orderByRaw('COUNT(*) DESC')
                ->value('category_id');
                
            if ($mostViewedCategory) {
                $filters['boost_category_id'] = $mostViewedCategory;
            }
        }

        $products = $this->productRepo->getActive(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'data' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid, ['category', 'brand', 'images', 'reviews.user', 'store', 'variations.options']);

        if ($product->status->value !== 'active') {
            abort(404, 'Product not found or inactive.');
        }

        $this->productRepo->incrementViews($product);

        if ($request->user() || $request->hasCookie('session_id')) {
            \App\Models\UserProductView::create([
                'user_id' => $request->user()?->id,
                'session_id' => $request->cookie('session_id') ?? request()->getSession()->getId(),
                'product_id' => $product->id,
                'category_id' => $product->category_id,
            ]);
        }

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function related(string $uuid): JsonResponse
    {
        $product = $this->productRepo->findByUuid($uuid);
        $relatedProducts = $this->productRepo->getRelated($product);

        return response()->json([
            'data' => ProductResource::collection($relatedProducts),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $term = $request->input('q');

        // Allow searching by category even if term is empty
        if (!$term && !$request->has('category_id')) {
            return response()->json(['data' => []]);
        }

        $products = $this->productRepo->search(
            $term ?? '', 
            $request->input('per_page', 15),
            $request->only(['category_id'])
        );

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
