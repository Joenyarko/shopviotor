<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayawayCard extends Model
{
    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'total_boxes', 'box_price', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function payments()
    {
        return $this->hasMany(LayawayPayment::class);
    }
}
