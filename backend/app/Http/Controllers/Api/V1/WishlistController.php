<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(private WishlistService $wishlistService) {}

    public function index(Request $request): JsonResponse
    {
        $wishlist = $this->wishlistService->getUserWishlist(
            $request->user()->id,
            $request->input('per_page', 15)
        );

        // Map the wishlist entries to just the product resource
        $products = $wishlist->getCollection()->map(fn($item) => $item->product);
        $wishlist->setCollection($products);

        return response()->json([
            'data' => ProductResource::collection($wishlist)->response()->getData(true),
        ]);
    }

    public function toggle(Request $request, string $productId): JsonResponse
    {
        $product = \App\Models\Product::where('id', $productId)->orWhere('uuid', $productId)->firstOrFail();
        $result = $this->wishlistService->toggle($request->user()->id, $product->id);

        return response()->json([
            'message'    => "Product {$result['action']} from wishlist.",
            'wishlisted' => $result['wishlisted'],
        ]);
    }
}
