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
            'shipping_type'               => $this->shipping_type,
            'custom_shipping_fee'         => $this->custom_shipping_fee,
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
            'available_for_layaway'       => $this->available_for_layaway,
            'layaway_total_boxes'         => $this->layaway_total_boxes,
            'layaway_box_price'           => $this->layaway_box_price,
            'available_for_preorder'      => $this->available_for_preorder,
            'preorder_deposit_amount'     => $this->preorder_deposit_amount,
            'preorder_expected_date'      => $this->preorder_expected_date,
            'specifications'              => $this->specifications,
            'tags'                        => $this->tags,
            'primary_image'               => $this->primary_image,
            'category'                    => new CategoryResource($this->whenLoaded('category')),
            'brand'                       => new BrandResource($this->whenLoaded('brand')),
            'images'                      => ProductImageResource::collection($this->whenLoaded('images')),
            'variations'                  => $this->whenLoaded('variations', function () {
                return $this->variations->map(function ($variation) {
                    return [
                        'id'      => $variation->id,
                        'name'    => $variation->name,
                        'options' => $variation->options->map(function ($option) {
                            return [
                                'id'          => $option->id,
                                'value'       => $option->value,
                                'price_delta' => $option->price_delta,
                            ];
                        }),
                    ];
                });
            }),
            'reviews'                     => ReviewResource::collection($this->whenLoaded('reviews')),
            'store'                       => $this->whenLoaded('store', function () {
                return [
                    'id'   => $this->store->uuid ?? $this->store->id,
                    'name' => $this->store->name,
                    'slug' => $this->store->slug,
                    'logo' => $this->store->logo_url,
                ];
            }),
            'created_at'                  => $this->created_at,
        ];
    }
}
