<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class SubmitSellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'  => ['required', 'exists:categories,id'],
            'brand_id'     => ['nullable', 'exists:brands,id'],
            'item_name'    => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
            'condition'    => ['required', 'in:new,used,refurbished'],
            'asking_price' => ['required', 'numeric', 'min:1'],
            'images'       => ['required', 'array', 'min:1', 'max:5'],
            'images.*'     => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }
}
