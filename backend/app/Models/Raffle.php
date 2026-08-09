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

use App\Traits\LogsActivity;

class Raffle extends Model
{
    use HasFactory, SoftDeletes, HasUuid, LogsActivity;

    protected $fillable = [
        'uuid', 'title', 'description', 'product_id',
        'prize_description', 'prize_value', 'ticket_price',
        'max_tickets', 'max_participants', 'tickets_sold', 'status', 'image',
        'starts_at', 'ends_at', 'drawn_at', 'created_by', 'terms_conditions',
        'category', 'max_per_user', 'allow_multiple', 'is_sponsored',
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
            'allow_multiple' => 'boolean',
            'is_sponsored' => 'boolean',
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', RaffleStatus::Active->value)
            ->where(function ($q) {
                $q->whereNull('ends_at')
                  ->orWhere('ends_at', '>', now());
            });
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
        if (!$this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
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

    /**
     * Count unique participants (unique user_ids with at least 1 ticket).
     */
    public function getParticipantCountAttribute(): int
    {
        return $this->tickets()->distinct('user_id')->count('user_id');
    }

    /**
     * Check if the raffle is still open to NEW participants.
     * Existing participants are never blocked from buying more tickets (unless max_per_user hit).
     */
    public function hasAvailableParticipantSlots(): bool
    {
        if (is_null($this->max_participants)) return true;
        return $this->participant_count < $this->max_participants;
    }
}
