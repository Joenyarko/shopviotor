<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'subtitle', 'image', 'link', 'position',
        'is_active', 'sort_order', 'banner_campaign_id',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->whereHas('campaign', function ($q) {
                $q->where('is_active', true)
                  ->where(fn($sq) => $sq->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
                  ->where(fn($sq) => $sq->whereNull('ends_at')->orWhere('ends_at', '>=', now()));
            });
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(BannerCampaign::class, 'banner_campaign_id');
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image);
    }
}
