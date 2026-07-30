<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class StoreTransaction extends Model
{
    protected $fillable = [
        'uuid',
        'store_id',
        'reference_type',
        'reference_id',
        'type',
        'amount',
        'commission_amount',
        'description',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
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

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
