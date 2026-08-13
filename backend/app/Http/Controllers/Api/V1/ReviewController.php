<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function index($productUuid)
    {
        $product = Product::where('uuid', $productUuid)->firstOrFail();
        
        $reviews = Review::with('user:id,first_name,last_name,avatar')
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->latest()
            ->paginate(10);
            
        return response()->json([
            'status' => 'success',
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    public function store(Request $request, $productUuid)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'required|string',
        ]);

        $product = Product::where('uuid', $productUuid)->firstOrFail();

        // Check if user already reviewed this product
        $existingReview = Review::where('product_id', $product->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already reviewed this product.',
            ], 400);
        }

        // For now, assume reviews are automatically approved.
        $review = Review::create([
            'uuid' => Str::uuid()->toString(),
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'body' => $request->body,
            'status' => 'approved',
        ]);

        // Update product average rating
        $product->updateRatingStats();

        return response()->json([
            'status' => 'success',
            'message' => 'Review submitted successfully!',
            'data' => $review->load('user:id,first_name,last_name,avatar')
        ], 201);
    }
}
