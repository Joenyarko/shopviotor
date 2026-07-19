<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'          => ['required', 'exists:products,id'], // The item the user wants
            'notes'               => ['nullable', 'string', 'max:500'],
            'items'               => ['required', 'array', 'min:1'], // Items user is offering
            'items.*.item_name'   => ['required', 'string', 'max:255'],
            'items.*.description' => ['required', 'string'],
            'items.*.condition'   => ['required', 'in:new,used,refurbished'],
            'items.*.images'      => ['required', 'array', 'min:1', 'max:5'],
            'items.*.images.*'    => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }
}
