<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TradeItem extends Model
{
    protected $fillable = [
        'trade_request_id', 'item_name', 'description',
        'condition', 'images', 'estimated_value', 'admin_valued_at',
    ];

    protected function casts(): array
    {
        return [
            'images'          => 'array',
            'estimated_value' => 'decimal:2',
            'admin_valued_at' => 'decimal:2',
        ];
    }

    public function tradeRequest(): BelongsTo
    {
        return $this->belongsTo(TradeRequest::class);
    }
}
