<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRaffleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
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
            'product_id' => 'nullable|exists:products,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image' => 'nullable', // Can be file or string
            'ticket_price' => 'required|numeric|min:0',
            'max_tickets' => 'nullable|integer|min:1',
            'ends_at' => 'nullable|date',
            'drawn_at' => 'nullable|date',
            'status' => 'required|in:active,draft,closed,completed',
            'prize_value' => 'nullable|numeric|min:0',
            'prize_description' => 'nullable|string',
            'category' => 'nullable|string',
            'max_per_user' => 'nullable|integer',
            'allow_multiple' => 'nullable|boolean',
            'is_sponsored' => 'nullable|boolean',
        ];
    }
}
