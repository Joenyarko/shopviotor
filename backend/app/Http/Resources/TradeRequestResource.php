<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TradeRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->uuid,
            'status'               => $this->status->value,
            'status_label'         => $this->status->label(),
            'notes'                => $this->notes,
            'product_value'        => $this->product_value,
            'target_product_price' => $this->target_product_price,
            'difference'           => $this->difference,
            'completed_at'         => $this->completed_at,
            'created_at'           => $this->created_at,
            'product'              => new ProductResource($this->whenLoaded('product')),
            'items'                => TradeItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
