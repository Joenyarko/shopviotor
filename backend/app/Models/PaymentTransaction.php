<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'payment_id', 'type', 'status', 'amount',
        'currency', 'gateway_transaction_id', 'payload', 'response',
    ];

    protected function casts(): array
    {
        return [
            'amount'   => 'decimal:2',
            'payload'  => 'array',
            'response' => 'array',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
