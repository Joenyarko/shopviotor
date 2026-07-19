<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'order_id',
        'rating', 'title', 'body', 'images', 'status',
        'is_verified_purchase', 'helpful_count',
        'moderated_by', 'moderated_at', 'moderation_notes',
    ];

    protected function casts(): array
    {
        return [
            'rating'               => 'integer',
            'images'               => 'array',
            'is_verified_purchase' => 'boolean',
            'moderated_at'         => 'datetime',
            'status'               => ReviewStatus::class,
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', ReviewStatus::Approved->value);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
