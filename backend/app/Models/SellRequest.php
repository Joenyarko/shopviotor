<?php

namespace App\Models;

use App\Enums\SellRequestStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SellRequest extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'category_id', 'brand_id',
        'item_name', 'description', 'condition',
        'asking_price', 'offered_price', 'counter_offer_price',
        'status', 'images', 'admin_notes', 'rejection_reason',
        'reviewed_by', 'reviewed_at', 'pickup_scheduled_at',
        'pickup_address', 'inspected_at', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'asking_price'         => 'decimal:2',
            'offered_price'        => 'decimal:2',
            'counter_offer_price'  => 'decimal:2',
            'images'               => 'array',
            'reviewed_at'          => 'datetime',
            'pickup_scheduled_at'  => 'datetime',
            'inspected_at'         => 'datetime',
            'paid_at'              => 'datetime',
            'status'               => SellRequestStatus::class,
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
