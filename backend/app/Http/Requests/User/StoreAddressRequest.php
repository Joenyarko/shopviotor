<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label'          => ['nullable', 'string', 'max:50'],
            'full_name'      => ['required', 'string', 'max:100'],
            'phone'          => ['required', 'string', 'max:20'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city'           => ['required', 'string', 'max:100'],
            'region'         => ['required', 'string', 'max:100'],
            'country'        => ['required', 'string', 'max:100'],
            'postal_code'    => ['nullable', 'string', 'max:20'],
            'is_default'     => ['boolean'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
