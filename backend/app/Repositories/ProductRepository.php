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

    public function getAdminProducts(int $perPage = 15, array $filters = [], array $relations = [])
    {
        $query = $this->model->with($relations);

        if (isset($filters['available_for_trade'])) {
            $query->where('available_for_trade', $filters['available_for_trade']);
        }
        if (isset($filters['is_preorder'])) {
            $query->where('available_for_preorder', $filters['is_preorder']);
        }
        if (isset($filters['available_for_preorder'])) {
            $query->where('available_for_preorder', filter_var($filters['available_for_preorder'], FILTER_VALIDATE_BOOLEAN));
        }
        if (isset($filters['available_for_layaway'])) {
            $val = filter_var($filters['available_for_layaway'], FILTER_VALIDATE_BOOLEAN);
            if ($val) {
                $query->where(function ($q) {
                    $q->where('available_for_layaway', true)->orWhere('is_layaway', true);
                });
            } else {
                $query->where(function ($q) {
                    $q->where('available_for_layaway', false)->where('is_layaway', false);
                });
            }
        } else {
            $query->where('is_layaway', false);
        }
        if (isset($filters['available_for_hire_purchase'])) {
            $query->where('available_for_hire_purchase', filter_var($filters['available_for_hire_purchase'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->latest()->paginate($perPage);
    }

    public function getActive(int $perPage = 15, array $filters = [])
    {
        $query = $this->model->active()->with(['category', 'brand', 'primaryImage', 'store']);

        if (!empty($filters['category_id'])) {
            $categoryIdentifier = $filters['category_id'];
            $category = \App\Models\Category::where('id', $categoryIdentifier)
                ->orWhere('slug', $categoryIdentifier)
                ->first();
                
            if ($category) {
                $categoryIds = array_merge([$category->id], $category->getAllDescendantIds());
                $query->whereIn('category_id', $categoryIds);
            }
        }
        if (!empty($filters['brand_id'])) {
            if (!is_numeric($filters['brand_id'])) {
                $query->whereHas('brand', function ($q) use ($filters) {
                    $q->where('slug', $filters['brand_id']);
                });
            } else {
                $query->where('brand_id', $filters['brand_id']);
            }
        }
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
        if (!empty($filters['condition'])) {
            if ($filters['condition'] === 'used') {
                $query->where('condition', '!=', 'new');
            } else {
                $query->where('condition', $filters['condition']);
            }
        }
        if (!empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }
        if (isset($filters['available_for_preorder'])) {
            $query->where('available_for_preorder', filter_var($filters['available_for_preorder'], FILTER_VALIDATE_BOOLEAN));
        }
        if (isset($filters['available_for_layaway'])) {
            $val = filter_var($filters['available_for_layaway'], FILTER_VALIDATE_BOOLEAN);
            if ($val) {
                $query->where(function ($q) {
                    $q->where('available_for_layaway', true)->orWhere('is_layaway', true);
                });
            } else {
                $query->where(function ($q) {
                    $q->where('available_for_layaway', false)->where('is_layaway', false);
                });
            }
        } else {
            $query->where('is_layaway', false);
        }
        if (isset($filters['available_for_hire_purchase'])) {
            $query->where('available_for_hire_purchase', filter_var($filters['available_for_hire_purchase'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'latest';
        if (!empty($filters['boost_category_id']) && $sort === 'latest') {
            $query->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$filters['boost_category_id']]);
        }

        match($sort) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular'    => $query->orderByDesc('views_count'),
            'rating'     => $query->orderByDesc('average_rating'),
            default      => $query->latest(),
        };

        return $query->paginate($perPage);
    }

    public function findByUuid(string $uuid, array $relations = []): Product
    {
        $query = $this->model->with($relations);

        if (is_numeric($uuid)) {
            return $query->where('id', $uuid)->firstOrFail();
        }

        return $query->where('uuid', $uuid)->firstOrFail();
    }

    public function search(string $term, int $perPage = 15, array $filters = [])
    {
        $query = $this->model->active()
            ->where('is_layaway', false)
            ->search($term)
            ->with(['category', 'brand', 'primaryImage', 'store']);
            
        if (!empty($filters['category_id'])) {
            $categoryIdentifier = $filters['category_id'];
            $category = \App\Models\Category::where('id', $categoryIdentifier)
                ->orWhere('slug', $categoryIdentifier)
                ->first();
                
            if ($category) {
                $categoryIds = array_merge([$category->id], $category->getAllDescendantIds());
                $query->whereIn('category_id', $categoryIds);
            }
        }
            
        return $query->paginate($perPage);
    }

    public function getFeatured(int $limit = 12)
    {
        return $this->model->featured()
            ->where('is_layaway', false)
            ->with(['category', 'brand', 'primaryImage', 'store'])
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
