<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->uuid,
            'order_number'        => $this->order_number,
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'subtotal'            => $this->subtotal,
            'discount_amount'     => $this->discount_amount,
            'shipping_amount'     => $this->shipping_amount,
            'tax_amount'          => $this->tax_amount,
            'total'               => $this->total,
            'currency'            => $this->currency,
            'notes'               => $this->notes,
            'paid_at'             => $this->paid_at,
            'shipped_at'          => $this->shipped_at,
            'delivered_at'        => $this->delivered_at,
            'cancelled_at'        => $this->cancelled_at,
            'cancellation_reason' => $this->cancellation_reason,
            'created_at'          => $this->created_at,
            'user'                => new UserResource($this->whenLoaded('user')),
            'address'             => new AddressResource($this->whenLoaded('address')),
            'items'               => OrderItemResource::collection($this->whenLoaded('items')),
            'payment'             => new PaymentResource($this->whenLoaded('payment')),
        ];
    }
}
