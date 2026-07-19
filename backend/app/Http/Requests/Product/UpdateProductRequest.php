<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name'                        => ['sometimes', 'string', 'max:255'],
            'description'                 => ['sometimes', 'string'],
            'short_description'           => ['nullable', 'string', 'max:500'],
            'price'                       => ['sometimes', 'numeric', 'min:0.01'],
            'compare_price'               => ['nullable', 'numeric', 'min:0'],
            'stock_quantity'              => ['sometimes', 'integer', 'min:0'],
            'category_id'                 => ['sometimes', 'exists:categories,id'],
            'brand_id'                    => ['nullable', 'exists:brands,id'],
            'condition'                   => ['sometimes', 'in:new,used,refurbished'],
            'status'                      => ['sometimes', 'in:draft,active,inactive,sold,suspended'],
            'is_featured'                 => ['boolean'],
            'is_negotiable'               => ['boolean'],
            'available_for_hire_purchase' => ['boolean'],
            'available_for_trade'         => ['boolean'],
            'images'                      => ['nullable', 'array', 'max:10'],
            'images.*'                    => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }
}
