<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Store extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'name', 'slug', 'logo', 'banner',
        'description', 'phone', 'whatsapp', 'location',
        'status', 'subscription_plan', 'commission_rate',
        'can_offer_layaway', 'can_offer_hire_purchase',
        'can_offer_preorders', 'can_offer_trades',
        'approved_at', 'suspended_at',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate'         => 'decimal:2',
            'can_offer_layaway'       => 'boolean',
            'can_offer_hire_purchase' => 'boolean',
            'can_offer_preorders'     => 'boolean',
            'can_offer_trades'        => 'boolean',
            'approved_at'             => 'datetime',
            'suspended_at'            => 'datetime',
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    public function getBannerUrlAttribute(): ?string
    {
        return $this->banner ? asset('storage/' . $this->banner) : null;
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
