<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaffleWinner extends Model
{
    protected $fillable = [
        'raffle_id', 'raffle_ticket_id', 'user_id',
        'verification_code', 'is_verified', 'verified_at',
        'prize_collected', 'prize_collected_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_verified'        => 'boolean',
            'prize_collected'    => 'boolean',
            'verified_at'        => 'datetime',
            'prize_collected_at' => 'datetime',
        ];
    }

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(RaffleTicket::class, 'raffle_ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
