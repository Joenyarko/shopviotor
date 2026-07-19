<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HirePurchaseInstallmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'installment_number' => $this->installment_number,
            'amount_due'         => $this->amount_due,
            'amount_paid'        => $this->amount_paid,
            'late_fee'           => $this->late_fee,
            'due_date'           => $this->due_date,
            'paid_at'            => $this->paid_at,
            'status'             => $this->status,
            'is_overdue'         => $this->isOverdue(),
        ];
    }
}
