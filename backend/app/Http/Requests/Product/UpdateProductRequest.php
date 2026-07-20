<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    protected function prepareForValidation()
    {
        $merge = [];
        
        if ($this->category_id && !is_numeric($this->category_id)) {
            $category = \App\Models\Category::where('uuid', $this->category_id)->first();
            if ($category) {
                $merge['category_id'] = $category->id;
            }
        }

        if ($this->brand_id && !is_numeric($this->brand_id)) {
            $brand = \App\Models\Brand::where('uuid', $this->brand_id)->first();
            if ($brand) {
                $merge['brand_id'] = $brand->id;
            }
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
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
            'available_for_layaway'       => ['boolean'],
            'layaway_daily_amount'        => ['nullable', 'numeric', 'min:0'],
            'layaway_weekly_amount'       => ['nullable', 'numeric', 'min:0'],
            'images'                      => ['nullable', 'array', 'max:10'],
            'images.*'                    => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }
}
