<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Store extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'user_id', 'name', 'slug', 'logo', 'banner', 'banners',
        'description', 'phone', 'whatsapp', 'location',
        'status', 'subscription_plan', 'commission_rate',
        'can_offer_layaway', 'can_offer_hire_purchase',
        'can_offer_preorders', 'can_offer_trades',
        'approved_at', 'suspended_at',
    ];

    protected function casts(): array
    {
        return [
            'banners'                 => 'array',
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
        if (!$this->logo) return null;
        return \Illuminate\Support\Str::startsWith($this->logo, ['http://', 'https://']) 
            ? $this->logo 
            : asset('storage/' . $this->logo);
    }

    public function getBannerUrlAttribute(): ?string
    {
        if (!$this->banner) return null;
        return \Illuminate\Support\Str::startsWith($this->banner, ['http://', 'https://']) 
            ? $this->banner 
            : asset('storage/' . $this->banner);
    }

    public function getBannersUrlsAttribute(): array
    {
        $urls = [];
        if ($this->banners && is_array($this->banners)) {
            foreach ($this->banners as $path) {
                $urls[] = \Illuminate\Support\Str::startsWith($path, ['http://', 'https://']) 
                    ? $path 
                    : asset('storage/' . $path);
            }
        }
        return $urls;
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

    public function wallet(): HasOne
    {
        return $this->hasOne(StoreWallet::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(StoreTransaction::class);
    }

    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }
}
