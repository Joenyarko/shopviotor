<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'uuid', 'name', 'slug', 'description', 'logo', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) return null;
        return \Illuminate\Support\Str::startsWith($this->logo, ['http://', 'https://']) 
            ? $this->logo 
            : asset('storage/' . $this->logo);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
