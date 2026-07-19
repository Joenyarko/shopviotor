<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'order_number', 'user_id', 'address_id', 'coupon_id',
        'status', 'subtotal', 'discount_amount', 'shipping_amount',
        'tax_amount', 'total', 'currency', 'notes', 'admin_notes',
        'paid_at', 'shipped_at', 'delivered_at', 'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total'           => 'decimal:2',
            'paid_at'         => 'datetime',
            'shipped_at'      => 'datetime',
            'delivered_at'    => 'datetime',
            'cancelled_at'    => 'datetime',
            'status'          => OrderStatus::class,
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = $order->order_number ?? static::generateOrderNumber();
        });
    }

    public static function generateOrderNumber(): string
    {
        return 'VIO-' . strtoupper(uniqid());
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::Pending->value);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', OrderStatus::Delivered->value);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'payable_id')
            ->where('payable_type', self::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
