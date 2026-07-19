<?php

namespace App\Services;

use App\Models\Wishlist;
use Illuminate\Validation\ValidationException;

class WishlistService
{
    public function toggle(int $userId, int $productId): array
    {
        $exists = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($exists) {
            $exists->delete();
            return ['action' => 'removed', 'wishlisted' => false];
        }

        Wishlist::create(['user_id' => $userId, 'product_id' => $productId]);
        return ['action' => 'added', 'wishlisted' => true];
    }

    public function getUserWishlist(int $userId, int $perPage = 15)
    {
        return Wishlist::where('user_id', $userId)
            ->with(['product.primaryImage', 'product.category'])
            ->latest()
            ->paginate($perPage);
    }

    public function isWishlisted(int $userId, int $productId): bool
    {
        return Wishlist::where('user_id', $userId)->where('product_id', $productId)->exists();
    }
}
