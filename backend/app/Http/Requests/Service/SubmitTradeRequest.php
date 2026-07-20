<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->product_id && !is_numeric($this->product_id)) {
            $product = \App\Models\Product::where('uuid', $this->product_id)->first();
            if ($product) {
                $this->merge(['product_id' => $product->id]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'product_id'          => ['nullable', 'exists:products,id'], // The item the user wants (nullable for open trades)
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
