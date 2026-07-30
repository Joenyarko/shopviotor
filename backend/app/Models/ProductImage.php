<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'path', 'alt_text', 'is_primary', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    public function getUrlAttribute(): string
    {
        return \Illuminate\Support\Str::startsWith($this->path, ['http://', 'https://']) 
            ? $this->path 
            : asset('storage/' . $this->path);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
