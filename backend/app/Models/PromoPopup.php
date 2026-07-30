<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PromoPopup extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'image_path',
        'link_url',
        'target_page',
        'is_active',
        'banner_campaign_id',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(BannerCampaign::class, 'banner_campaign_id');
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

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }
}
