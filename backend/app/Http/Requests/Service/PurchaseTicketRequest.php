<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method'   => ['nullable', 'string'],
            'phone'            => ['nullable', 'string'],
            'quantity'         => ['nullable', 'integer', 'min:1'],
        ];
    }
}
