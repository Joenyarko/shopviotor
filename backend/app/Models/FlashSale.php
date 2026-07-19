<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FlashSale extends Model
{
    protected $fillable = [
        'title',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['flash_price', 'stock_allocated', 'stock_sold'])
            ->withTimestamps();
    }
}
