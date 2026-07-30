<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BannerCampaign extends Model
{
    protected $fillable = [
        'name',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function banners()
    {
        return $this->hasMany(Banner::class);
    }

    public function promoPopups()
    {
        return $this->hasMany(PromoPopup::class);
    }
}
