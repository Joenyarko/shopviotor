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
            'payment_method'   => ['required', 'in:paystack,mobile_money,bank_transfer'],
            'payment_phone'    => ['required_if:payment_method,mobile_money', 'string'],
            'payment_provider' => ['required_if:payment_method,mobile_money', 'in:mtn,vodafone,tigo'],
        ];
    }
}
