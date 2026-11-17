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
            'student_id'                   => $this->student_id,
            'student_name'                 => $this->student_name,
            'student_course'               => $this->student_course,
            'student_level'                => $this->student_level,
            'student_id_picture_url'       => $this->student_id_picture_url,
            'student_verification_status'  => $this->student_verification_status ?? 'unverified',
            'applicant_type'               => $this->applicant_type ?? 'student',
            'ghana_card_number'            => $this->ghana_card_number,
            'ghana_card_front_url'         => $this->ghana_card_front_url,
            'ghana_card_back_url'          => $this->ghana_card_back_url,
            'selfie_url'                   => $this->selfie_url,
            'digital_address'              => $this->digital_address,
            'occupation'                   => $this->occupation,
            'employer_name'                => $this->employer_name,
            'monthly_income'               => $this->monthly_income,
            'next_of_kin_name'             => $this->next_of_kin_name,
            'next_of_kin_phone'            => $this->next_of_kin_phone,
            'next_of_kin_relation'         => $this->next_of_kin_relation,
            'identity_verification_status' => $this->identity_verification_status ?? 'unverified',
            'dojah_reference'              => $this->dojah_reference,
            'addresses'     => AddressResource::collection($this->whenLoaded('addresses')),
        ];
    }
}
