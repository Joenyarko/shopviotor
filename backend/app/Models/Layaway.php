<?php

namespace App\Models;

use App\Enums\LayawayStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Layaway extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'status',
        'product_price', 'total_paid', 'balance_remaining',
        'payment_count', 'target_completion_date',
        'completed_at', 'cancelled_at', 'notes',
        'customer_phone', 'customer_address',
    ];

    protected function casts(): array
    {
        return [
            'product_price'          => 'decimal:2',
            'total_paid'             => 'decimal:2',
            'balance_remaining'      => 'decimal:2',
            'target_completion_date' => 'date',
            'completed_at'           => 'datetime',
            'cancelled_at'           => 'datetime',
            'status'                 => LayawayStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LayawayPayment::class);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->product_price == 0) return 100;
        return round(($this->total_paid / $this->product_price) * 100, 1);
    }
}
