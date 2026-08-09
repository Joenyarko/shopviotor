<?php

namespace App\Models;

use App\Enums\HirePurchaseStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\LogsActivity;

class HirePurchase extends Model
{
    use HasFactory, SoftDeletes, HasUuid, LogsActivity;

    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'order_id', 'status',
        'product_price', 'deposit_amount', 'total_amount', 'balance_remaining',
        'monthly_installment', 'duration_months', 'interest_rate', 'late_fee',
        'next_due_date', 'deposit_paid_at', 'completed_at', 'defaulted_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'product_price'      => 'decimal:2',
            'deposit_amount'     => 'decimal:2',
            'total_amount'       => 'decimal:2',
            'balance_remaining'  => 'decimal:2',
            'monthly_installment' => 'decimal:2',
            'interest_rate'      => 'decimal:2',
            'late_fee'           => 'decimal:2',
            'next_due_date'      => 'date',
            'deposit_paid_at'    => 'datetime',
            'completed_at'       => 'datetime',
            'defaulted_at'       => 'datetime',
            'status'             => HirePurchaseStatus::class,
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(HirePurchaseInstallment::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === HirePurchaseStatus::Completed;
    }

    public function getPaymentProgressAttribute(): float
    {
        if ($this->total_amount == 0) return 100;
        return round((($this->total_amount - $this->balance_remaining) / $this->total_amount) * 100, 1);
    }
}
