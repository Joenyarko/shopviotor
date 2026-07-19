<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name'                        => ['required', 'string', 'max:255'],
            'description'                 => ['required', 'string'],
            'short_description'           => ['nullable', 'string', 'max:500'],
            'price'                       => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'compare_price'               => ['nullable', 'numeric', 'min:0'],
            'cost_price'                  => ['nullable', 'numeric', 'min:0'],
            'stock_quantity'              => ['required', 'integer', 'min:0'],
            'sku'                         => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'category_id'                 => ['required', 'exists:categories,id'],
            'brand_id'                    => ['nullable', 'exists:brands,id'],
            'condition'                   => ['required', 'in:new,used,refurbished'],
            'status'                      => ['required', 'in:draft,active,inactive'],
            'is_featured'                 => ['boolean'],
            'is_negotiable'               => ['boolean'],
            'available_for_hire_purchase' => ['boolean'],
            'available_for_trade'         => ['boolean'],
            'location'                    => ['nullable', 'string', 'max:255'],
            'city'                        => ['nullable', 'string', 'max:100'],
            'region'                      => ['nullable', 'string', 'max:100'],
            'specifications'              => ['nullable', 'array'],
            'tags'                        => ['nullable', 'array'],
            'meta_title'                  => ['nullable', 'string', 'max:255'],
            'meta_description'            => ['nullable', 'string', 'max:500'],
            'images'                      => ['nullable', 'array', 'max:10'],
            'images.*'                    => ['image', 'mimes:jpeg,png,webp', 'max:5120'], // 5MB max
        ];
    }
}
