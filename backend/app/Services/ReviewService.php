<?php

namespace App\Services;

use App\Models\Review;
use App\Repositories\ProductRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    public function __construct(private ProductRepository $productRepo) {}

    public function submit(int $userId, array $data): Review
    {
        // Prevent duplicate review for same product+order combination
        $exists = Review::where('user_id', $userId)
            ->where('product_id', $data['product_id'])
            ->when(isset($data['order_id']), fn($q) => $q->where('order_id', $data['order_id']))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'product_id' => ['You have already reviewed this product for this order.'],
            ]);
        }

        return DB::transaction(function () use ($userId, $data) {
            $images = $data['images'] ?? [];
            unset($data['images']);

            $uploadedPaths = [];
            foreach ($images as $file) {
                $path = $file->store("reviews/{$userId}", 'public');
                $uploadedPaths[] = $path;
            }

            $review = Review::create(array_merge($data, [
                'user_id'              => $userId,
                'images'               => $uploadedPaths ?: null,
                'status'               => 'pending',
                'is_verified_purchase' => $this->isVerifiedPurchase($userId, $data['product_id'], $data['order_id'] ?? null),
            ]));

            return $review;
        });
    }

    public function approve(Review $review, int $moderatorId): Review
    {
        $review->update([
            'status'        => 'approved',
            'moderated_by'  => $moderatorId,
            'moderated_at'  => now(),
        ]);

        $this->productRepo->updateRating($review->product_id);

        return $review->fresh();
    }

    public function reject(Review $review, int $moderatorId, string $reason): Review
    {
        $review->update([
            'status'           => 'rejected',
            'moderated_by'     => $moderatorId,
            'moderated_at'     => now(),
            'moderation_notes' => $reason,
        ]);

        return $review->fresh();
    }

    private function isVerifiedPurchase(int $userId, int $productId, ?int $orderId): bool
    {
        return \App\Models\OrderItem::whereHas('order', fn($q) => $q->where('user_id', $userId)->where('status', 'delivered'))
            ->where('product_id', $productId)
            ->exists();
    }
}
