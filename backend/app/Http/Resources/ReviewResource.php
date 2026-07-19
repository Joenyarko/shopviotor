<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->uuid,
            'rating'               => $this->rating,
            'title'                => $this->title,
            'body'                 => $this->body,
            'images'               => array_map(fn($path) => asset('storage/' . $path), $this->images ?? []),
            'status'               => $this->status->value,
            'is_verified_purchase' => $this->is_verified_purchase,
            'helpful_count'        => $this->helpful_count,
            'created_at'           => $this->created_at,
            'user'                 => new UserResource($this->whenLoaded('user')),
            'product'              => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
