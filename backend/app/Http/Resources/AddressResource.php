<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'label'          => $this->label,
            'full_name'      => $this->full_name,
            'phone'          => $this->phone,
            'address_line_1' => $this->address_line_1,
            'address_line_2' => $this->address_line_2,
            'city'           => $this->city,
            'region'         => $this->region,
            'country'        => $this->country,
            'postal_code'    => $this->postal_code,
            'is_default'     => $this->is_default,
            'full_address'   => $this->full_address,
        ];
    }
}
