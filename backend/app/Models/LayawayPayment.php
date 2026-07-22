<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LayawayPayment extends Model
{
    protected $fillable = [
        'uuid', 'layaway_card_id', 'amount', 'boxes_covered', 'payment_method', 'reference', 'notes', 'color_code'
    ];

    protected function casts(): array
    {
        return [
            'amount'  => 'decimal:2',
        ];
    }

    public function layawayCard(): BelongsTo
    {
        return $this->belongsTo(LayawayCard::class);
    }
}
