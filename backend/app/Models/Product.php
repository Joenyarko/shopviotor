<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Traits\HasUuid;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasUuid, LogsActivity;

    protected $fillable = [
        'uuid', 'user_id', 'store_id', 'category_id', 'brand_id',
        'name', 'slug', 'description', 'short_description',
        'price', 'compare_price', 'cost_price',
        'stock_quantity', 'sku', 'barcode', 'condition', 'status',
        'is_featured',
        'is_negotiable',
        'available_for_hire_purchase',
        'is_layaway',
        'layaway_boxes',
        'available_for_trade',
        'available_for_preorder',
        'preorder_deposit_amount',
        'preorder_expected_date',
        'location', 'city', 'region',
        'specifications', 'tags', 'views_count', 'likes_count',
        'average_rating', 'reviews_count',
        'meta_title', 'meta_description', 'meta_keywords',
    ];

    protected function casts(): array
    {
        return [
            'price'                       => 'decimal:2',
            'compare_price'               => 'decimal:2',
            'cost_price'                  => 'decimal:2',
            'average_rating'              => 'decimal:2',
            'is_featured'                 => 'boolean',
            'is_negotiable'               => 'boolean',
            'available_for_hire_purchase' => 'boolean',
            'available_for_trade'         => 'boolean',
            'is_layaway'                  => 'boolean',
            'specifications'              => 'array',
            'tags'                        => 'array',
            'status'                      => ProductStatus::class,
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::Active->value);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('status', ProductStatus::Active->value);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->whereFullText(['name', 'description'], $term)
            ->orWhere('name', 'like', "%{$term}%");
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getPrimaryImageAttribute(): ?string
    {
        $primary = $this->images->where('is_primary', true)->first();
        return $primary ? asset('storage/' . $primary->path) : null;
    }

    public function getDiscountPercentageAttribute(): ?float
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 1);
        }
        return null;
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function layawayCards(): HasMany
    {
        return $this->hasMany(LayawayCard::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
