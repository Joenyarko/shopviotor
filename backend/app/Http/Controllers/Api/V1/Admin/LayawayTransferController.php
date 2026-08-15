<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\LayawayPlanCard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LayawayTransferController extends Controller
{
    /**
     * Convert a Layaway Physical Product into a Layaway Plan Card
     */
    public function productToCard($uuid)
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();

        // Create the card using the product's layaway pricing details
        $card = LayawayPlanCard::create([
            'uuid' => Str::uuid()->toString(),
            'name' => $product->name,
            'description' => $product->description,
            'number_of_boxes' => $product->layaway_total_boxes ?? 10,
            'price_per_box' => $product->layaway_box_price ?? 0,
            'image_url' => $product->primary_image,
            'status' => 'active'
        ]);

        // We completely delete the product since it was mistakenly created as a product
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product successfully transferred to a Layaway Card.',
            'data' => $card
        ]);
    }

    /**
     * Convert a Layaway Plan Card into a Layaway Physical Product
     */
    public function cardToProduct(Request $request, $uuid)
    {
        $card = LayawayPlanCard::where('uuid', $uuid)->firstOrFail();

        // Admin might have default category and store.
        // We will assign a default category if none exists (just get the first one)
        // and default store (get the first active store).
        $defaultCategory = \App\Models\Category::first();
        $defaultStore = \App\Models\Store::where('is_verified', true)->first() ?? \App\Models\Store::first();

        if (!$defaultCategory || !$defaultStore) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot transfer: No default Category or Store exists in the database to assign to this product.'
            ], 400);
        }

        $product = Product::create([
            'name' => $card->name,
            'slug' => Str::slug($card->name) . '-' . uniqid(),
            'description' => $card->description,
            'price' => $card->number_of_boxes * $card->price_per_box,
            'stock_quantity' => 10, // Default stock
            'condition' => 'new',
            'status' => 'active',
            'category_id' => $defaultCategory->id,
            'store_id' => $defaultStore->id,
            'primary_image' => $card->image_url,
            'available_for_layaway' => true,
            'layaway_total_boxes' => $card->number_of_boxes,
            'layaway_box_price' => $card->price_per_box
        ]);

        // Delete the original card
        $card->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Card successfully transferred to a Layaway Product.',
            'data' => $product
        ]);
    }
}
