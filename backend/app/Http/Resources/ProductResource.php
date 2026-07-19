<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                          => $this->uuid,
            'name'                        => $this->name,
            'slug'                        => $this->slug,
            'description'                 => $this->description,
            'short_description'           => $this->short_description,
            'price'                       => $this->price,
            'compare_price'               => $this->compare_price,
            'stock_quantity'              => $this->stock_quantity,
            'sku'                         => $this->sku,
            'condition'                   => $this->condition,
            'status'                      => $this->status->value,
            'average_rating'              => $this->average_rating,
            'reviews_count'               => $this->reviews_count,
            'views_count'                 => $this->views_count,
            'is_featured'                 => $this->is_featured,
            'is_negotiable'               => $this->is_negotiable,
            'available_for_hire_purchase' => $this->available_for_hire_purchase,
            'available_for_trade'         => $this->available_for_trade,
            'specifications'              => $this->specifications,
            'tags'                        => $this->tags,
            'primary_image'               => $this->primaryImage ? $this->primaryImage->url : null,
            'category'                    => new CategoryResource($this->whenLoaded('category')),
            'brand'                       => new BrandResource($this->whenLoaded('brand')),
            'images'                      => ProductImageResource::collection($this->whenLoaded('images')),
            'created_at'                  => $this->created_at,
        ];
    }
}
