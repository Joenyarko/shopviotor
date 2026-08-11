<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TradeItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'item_name'       => $this->item_name,
            'description'     => $this->description,
            'condition'       => $this->condition,
            'estimated_value' => $this->estimated_value,
            'admin_valued_at' => $this->admin_valued_at,
            'images'          => array_map(function($path) {
                return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
            }, $this->images ?? []),
        ];
    }
}
