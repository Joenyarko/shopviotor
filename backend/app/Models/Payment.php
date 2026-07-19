<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'payable_type', 'payable_id', 'user_id',
        'reference', 'method', 'gateway', 'status',
        'amount', 'currency', 'gateway_reference', 'gateway_status',
        'gateway_response', 'notes', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'gateway_response' => 'array',
            'paid_at'          => 'datetime',
            'status'           => PaymentStatus::class,
            'method'           => PaymentMethod::class,
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($payment) {
            $payment->reference = $payment->reference ?? 'VTR-' . strtoupper(uniqid());
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
