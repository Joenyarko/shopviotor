<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryImage = null;
        if ($this->relationLoaded('product') && $this->product) {
            $primaryImage = $this->product->primary_image;
        }

        return [
            'id'               => $this->id,
            'product_id'       => $this->product_id,
            'product_name'     => $this->product_name,
            'product_sku'      => $this->product_sku,
            'price'            => $this->price,
            'quantity'         => $this->quantity,
            'total'            => $this->total,
            'product_snapshot' => $this->product_snapshot,
            'image'            => $primaryImage,
            'product'          => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
