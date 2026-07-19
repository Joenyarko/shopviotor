<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.product_id'     => ['required', 'exists:products,id'],
            'items.*.quantity'       => ['required', 'integer', 'min:1'],
            'address_id'             => ['required', 'exists:addresses,id'],
            'coupon_code'            => ['nullable', 'string', 'exists:coupons,code'],
            'shipping_amount'        => ['nullable', 'numeric', 'min:0'],
            'tax_amount'             => ['nullable', 'numeric', 'min:0'],
            'notes'                  => ['nullable', 'string', 'max:500'],
            'payment_method'         => ['required', 'in:paystack,mobile_money,bank_transfer,cash'],
            // Required for mobile money
            'payment_phone'          => ['required_if:payment_method,mobile_money', 'string'],
            'payment_provider'       => ['required_if:payment_method,mobile_money', 'in:mtn,vodafone,tigo'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_phone.required_if'    => 'A phone number is required for mobile money payments.',
            'payment_provider.required_if' => 'Please select your mobile money provider.',
        ];
    }
}
