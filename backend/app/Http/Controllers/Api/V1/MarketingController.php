<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Collection;
use App\Models\FlashSale;
use Illuminate\Http\JsonResponse;

class MarketingController extends Controller
{
    /**
     * Get active campaigns (popups/banners)
     */
    public function activeCampaigns(): JsonResponse
    {
        $now = now();
        $campaigns = Campaign::where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', $now);
            })
            ->get();

        return response()->json(['data' => $campaigns]);
    }

    /**
     * Get active flash sales with their products
     */
    public function activeFlashSales(): JsonResponse
    {
        $now = now();
        $flashSales = FlashSale::with(['products' => function ($query) {
                $query->where('status', 'active')->with('images'); // Eager load primary image
            }])
            ->where('is_active', true)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->get();

        // Transform the response to include the primary image correctly and structure it nicely
        $flashSales->transform(function ($sale) {
            $sale->products->transform(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first() 
                                ?? $product->images->first();
                
                return [
                    'id' => $product->id,
                    'uuid' => $product->uuid,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'condition' => $product->condition,
                    'primary_image' => $primaryImage ? asset('storage/' . $primaryImage->path) : null,
                    'flash_price' => $product->pivot->flash_price,
                    'stock_allocated' => $product->pivot->stock_allocated,
                    'stock_sold' => $product->pivot->stock_sold,
                ];
            });
            return $sale;
        });

        return response()->json(['data' => $flashSales]);
    }

    /**
     * Get curated homepage collections
     */
    public function collections(): JsonResponse
    {
        $collections = Collection::with(['products' => function ($query) {
                $query->where('status', 'active')->with('images');
            }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $collections->transform(function ($collection) {
            $collection->products->transform(function ($product) {
                 $primaryImage = $product->images->where('is_primary', true)->first() 
                                ?? $product->images->first();
                                
                 return [
                    'id' => $product->id,
                    'uuid' => $product->uuid,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'condition' => $product->condition,
                    'primary_image' => $primaryImage ? asset('storage/' . $primaryImage->path) : null,
                    'sort_order' => $product->pivot->sort_order,
                ];
            });
            return $collection;
        });

        return response()->json(['data' => $collections]);
    }
}
