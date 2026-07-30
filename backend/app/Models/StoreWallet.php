<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreWallet extends Model
{
    protected $fillable = [
        'store_id',
        'available_balance',
        'pending_balance',
        'total_earned',
    ];

    protected $casts = [
        'available_balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
