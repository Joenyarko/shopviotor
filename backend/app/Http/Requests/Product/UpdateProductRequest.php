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

        if ($this->has('variations') && is_string($this->variations)) {
            $merge['variations'] = json_decode($this->variations, true);
        }
        
        if ($this->has('specifications') && is_string($this->specifications)) {
            $merge['specifications'] = json_decode($this->specifications, true);
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'name'                        => ['sometimes', 'required', 'string', 'max:255'],
            'description'                 => ['sometimes', 'required', 'string'],
            'short_description'           => ['nullable', 'string', 'max:500'],
            'price'                       => ['sometimes', 'required', 'numeric', 'min:0'],
            'compare_price'               => ['nullable', 'numeric', 'gte:price'],
            'cost_price'                  => ['nullable', 'numeric', 'min:0'],
            'shipping_type'               => ['nullable', 'in:free,default,custom'],
            'custom_shipping_fee'         => ['nullable', 'required_if:shipping_type,custom', 'numeric', 'min:0'],
            'stock_quantity'              => ['sometimes', 'required', 'integer', 'min:0'],
            'sku'                         => ['nullable', 'string', 'max:100', Rule::unique('products')->ignore($productId)],
            'barcode'                     => ['nullable', 'string', 'max:100', Rule::unique('products')->ignore($productId)],
            'condition'                   => ['sometimes', 'required', 'string', 'in:new,used_good,used_fair,refurbished'],
            'status'                      => ['nullable', 'string', 'in:active,inactive,draft'],
            'is_featured'                 => ['nullable', 'boolean'],
            'is_negotiable'               => ['nullable', 'boolean'],
            'available_for_hire_purchase' => ['nullable', 'boolean'],
            'hp_interest_rate'            => ['nullable', 'numeric', 'min:0', 'max:100'],
            'hp_min_deposit_percent'      => ['nullable', 'numeric', 'min:0', 'max:100'],
            'hp_max_duration_months'      => ['nullable', 'integer', 'min:1', 'max:120'],
            'available_for_trade'         => ['nullable', 'boolean'],
            'is_layaway'                  => ['nullable', 'boolean'],
            'available_for_layaway'       => ['nullable', 'boolean'],
            'available_for_preorder'      => ['nullable', 'boolean'],
            'preorder_deposit_amount'     => ['nullable', 'numeric', 'min:0'],
            'preorder_expected_date'      => ['nullable', 'date'],
            'layaway_boxes'               => ['nullable', 'integer', 'min:1'],
            'layaway_total_boxes'         => ['nullable', 'integer', 'min:1'],
            'layaway_box_price'           => ['nullable', 'numeric', 'min:0'],
            'category_id'                 => ['sometimes', 'required', 'exists:categories,id'],
            'brand_id'                    => ['nullable', 'exists:brands,id'],
            'existing_images'             => ['nullable', 'array'],
            'existing_images.*'           => ['exists:product_images,id'],
            'images'                      => ['nullable', 'array', 'max:5'],
            'images.*'                    => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            
            'variations'                  => ['nullable', 'array'],
            'variations.*.name'           => ['required', 'string', 'max:100'],
            'variations.*.options'        => ['required', 'array', 'min:1'],
            'variations.*.options.*.value'       => ['required', 'string', 'max:100'],
            'variations.*.options.*.price_delta' => ['nullable', 'numeric'],

            'location'                    => ['nullable', 'string', 'max:255'],
            'city'                        => ['nullable', 'string', 'max:100'],
            'region'                      => ['nullable', 'string', 'max:100'],
            'specifications'              => ['nullable', 'array'],
            'tags'                        => ['nullable', 'array'],
            'meta_title'                  => ['nullable', 'string', 'max:255'],
            'meta_description'            => ['nullable', 'string', 'max:500'],
        ];
    }
}
