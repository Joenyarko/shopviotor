<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HirePurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->uuid,
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'product_price'       => $this->product_price,
            'deposit_amount'      => $this->deposit_amount,
            'total_amount'        => $this->total_amount,
            'balance_remaining'   => $this->balance_remaining,
            'monthly_installment' => $this->monthly_installment,
            'duration_months'     => $this->duration_months,
            'interest_rate'       => $this->interest_rate,
            'late_fee'            => $this->late_fee,
            'next_due_date'       => $this->next_due_date,
            'deposit_paid_at'     => $this->deposit_paid_at,
            'completed_at'        => $this->completed_at,
            'defaulted_at'        => $this->defaulted_at,
            'payment_progress'    => $this->payment_progress,
            'created_at'          => $this->created_at,
            'product'             => new ProductResource($this->whenLoaded('product')),
            'installments'        => HirePurchaseInstallmentResource::collection($this->whenLoaded('installments')),
        ];
    }
}
