<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HirePurchaseInstallment extends Model
{
    protected $fillable = [
        'hire_purchase_id', 'installment_number', 'amount_due',
        'amount_paid', 'late_fee', 'due_date', 'paid_at',
        'status', 'payment_reference',
    ];

    protected function casts(): array
    {
        return [
            'amount_due'  => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'late_fee'    => 'decimal:2',
            'due_date'    => 'date',
            'paid_at'     => 'datetime',
        ];
    }

    public function hirePurchase(): BelongsTo
    {
        return $this->belongsTo(HirePurchase::class);
    }

    public function isOverdue(): bool
    {
        return $this->status !== 'paid' && $this->due_date->isPast();
    }
}
