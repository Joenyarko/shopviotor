<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LayawayPlanCard extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid', 'name', 'image_url', 'number_of_boxes', 'price_per_box', 'description', 'status'
    ];

    protected function casts(): array
    {
        return [
            'price_per_box' => 'decimal:2',
            'number_of_boxes' => 'integer',
        ];
    }
}
