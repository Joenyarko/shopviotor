<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'order_id'   => ['nullable', 'exists:orders,id'],
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'title'      => ['required', 'string', 'max:255'],
            'body'       => ['required', 'string', 'min:10'],
            'images'     => ['nullable', 'array', 'max:3'],
            'images.*'   => ['image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }
}
