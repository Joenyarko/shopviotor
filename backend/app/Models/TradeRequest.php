<?php

namespace App\Models;

use App\Enums\TradeRequestStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TradeRequest extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'status', 'notes', 'admin_notes',
        'product_value', 'target_product_price', 'difference',
        'reviewed_by', 'reviewed_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'product_value'         => 'decimal:2',
            'target_product_price'  => 'decimal:2',
            'difference'            => 'decimal:2',
            'reviewed_at'           => 'datetime',
            'completed_at'          => 'datetime',
            'status'                => TradeRequestStatus::class,
        ];
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

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TradeItem::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
