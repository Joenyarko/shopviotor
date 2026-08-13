<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class LayawayCard extends Model
{
    use LogsActivity;
    protected $fillable = [
        'uuid', 'user_id', 'product_id', 'layaway_plan_card_id', 'total_boxes', 'box_price', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function layawayPlanCard()
    {
        return $this->belongsTo(LayawayPlanCard::class);
    }

    public function payments()
    {
        return $this->hasMany(LayawayPayment::class);
    }
}
