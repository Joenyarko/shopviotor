<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->uuid,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'icon'        => $this->icon,
            'image'       => $this->image_url,
            'parent_id'   => $this->parent?->uuid,
            'children'    => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
