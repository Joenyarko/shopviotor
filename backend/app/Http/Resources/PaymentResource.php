<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->uuid,
            'uuid'           => $this->uuid,
            'reference'      => $this->reference,
            'method'         => $this->method->value,
            'method_label'   => $this->method->label(),
            'gateway'        => $this->gateway,
            'status'         => $this->status->value,
            'status_label'   => $this->status->label(),
            'amount'         => $this->amount,
            'currency'       => $this->currency,
            'paid_at'        => $this->paid_at,
            'gateway_status' => $this->gateway_status,
            'created_at'     => $this->created_at,
        ];
    }
}
