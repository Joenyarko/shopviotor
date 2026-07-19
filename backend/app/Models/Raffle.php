<?php

namespace App\Models;

use App\Enums\RaffleStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Raffle extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'title', 'description', 'product_id',
        'prize_description', 'prize_value', 'ticket_price',
        'max_tickets', 'tickets_sold', 'status', 'image',
        'starts_at', 'ends_at', 'drawn_at', 'created_by', 'terms_conditions',
    ];

    protected function casts(): array
    {
        return [
            'prize_value'   => 'decimal:2',
            'ticket_price'  => 'decimal:2',
            'starts_at'     => 'datetime',
            'ends_at'       => 'datetime',
            'drawn_at'      => 'datetime',
            'status'        => RaffleStatus::class,
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', RaffleStatus::Active->value)
            ->where('ends_at', '>', now());
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(RaffleTicket::class);
    }

    public function winner(): HasOne
    {
        return $this->hasOne(RaffleWinner::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function hasAvailableTickets(): bool
    {
        if (is_null($this->max_tickets)) return true;
        return $this->tickets_sold < $this->max_tickets;
    }

    public function getAvailableTicketsAttribute(): ?int
    {
        if (is_null($this->max_tickets)) return null;
        return $this->max_tickets - $this->tickets_sold;
    }
}
