<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->uuid,
            'item_name'           => $this->item_name,
            'contact_number'      => $this->contact_number,
            'description'         => $this->description,
            'condition'           => $this->condition,
            'asking_price'        => $this->asking_price,
            'offered_price'       => $this->offered_price,
            'counter_offer_price' => $this->counter_offer_price,
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'images'              => array_map(function($path) {
                return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
            }, $this->images ?? []),
            'rejection_reason'    => $this->rejection_reason,
            'pickup_scheduled_at' => $this->pickup_scheduled_at,
            'pickup_address'      => $this->pickup_address,
            'inspected_at'        => $this->inspected_at,
            'paid_at'             => $this->paid_at,
            'created_at'          => $this->created_at,
            'category'            => new CategoryResource($this->whenLoaded('category')),
            'brand'               => new BrandResource($this->whenLoaded('brand')),
            'user'                => [
                'name' => $this->whenLoaded('user') ? $this->user->full_name : null,
                'email' => $this->whenLoaded('user') ? $this->user->email : null,
            ],
        ];
    }
}
