<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RaffleTicket extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid', 'raffle_id', 'user_id', 'ticket_number',
        'amount_paid', 'payment_reference', 'is_winner',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'is_winner'   => 'boolean',
        ];
    }

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function winnerRecord(): HasOne
    {
        return $this->hasOne(RaffleWinner::class);
    }
}
