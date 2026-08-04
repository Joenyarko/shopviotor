<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->uuid,
            'first_name'    => $this->first_name,
            'last_name'     => $this->last_name,
            'name'          => $this->name,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'avatar'        => $this->avatar_url,
            'role'          => $this->role->value,
            'is_active'     => $this->is_active,
            'email_verified'=> $this->hasVerifiedEmail(),
            'created_at'    => $this->created_at,
            'has_store'     => $this->store()->exists(),
            'addresses'     => AddressResource::collection($this->whenLoaded('addresses')),
        ];
    }
}
