<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Interfaces\BaseRepositoryInterface;

class ProductRepository extends BaseRepository
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function getActive(int $perPage = 15, array $filters = [])
    {
        $query = $this->model->active()->with(['category', 'brand', 'primaryImage']);

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
        if (!empty($filters['condition'])) {
            $query->where('condition', $filters['condition']);
        }
        if (!empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        $sort = $filters['sort'] ?? 'latest';
        match($sort) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular'    => $query->orderByDesc('views_count'),
            'rating'     => $query->orderByDesc('average_rating'),
            default      => $query->latest(),
        };

        return $query->paginate($perPage);
    }

    public function search(string $term, int $perPage = 15)
    {
        return $this->model->active()
            ->search($term)
            ->with(['category', 'brand', 'primaryImage'])
            ->paginate($perPage);
    }

    public function getFeatured(int $limit = 12)
    {
        return $this->model->featured()
            ->with(['category', 'brand', 'primaryImage'])
            ->limit($limit)
            ->get();
    }

    public function incrementViews(Product $product): void
    {
        $product->increment('views_count');
    }

    public function updateRating(int $productId): void
    {
        $product = $this->model->find($productId);
        if ($product) {
            $product->update([
                'average_rating' => $product->reviews()->avg('rating') ?? 0,
                'reviews_count'  => $product->reviews()->count(),
            ]);
        }
    }
}
