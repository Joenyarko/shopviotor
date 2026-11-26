<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HirePurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusVal = $this->status instanceof \BackedEnum ? $this->status->value : (string) $this->status;

        // Infer payment_schedule gracefully if column isn't populated on older agreements
        $schedule = $this->payment_schedule ?? null;
        if (!$schedule && is_string($this->notes)) {
            if (stripos($this->notes, 'WEEKLY') !== false) {
                $schedule = 'weekly';
            } elseif (stripos($this->notes, 'DAILY') !== false) {
                $schedule = 'daily';
            }
        }
        $schedule = $schedule ?: 'monthly';

        $depositPaid = !is_null($this->deposit_paid_at) || in_array($statusVal, ['active', 'completed'], true);
        $installmentsPaidSum = $this->relationLoaded('installments')
            ? (float) $this->installments->where('status', 'paid')->sum(fn ($i) => (float) ($i->amount_paid ?: $i->amount_due))
            : 0.0;

        $amountPaid = ($depositPaid ? (float) $this->deposit_amount : 0.0) + $installmentsPaidSum;
        $totalAmount = (float) $this->total_amount;
        $amountPaid = min($totalAmount, round($amountPaid, 2));
        $totalRemaining = max(0, round($totalAmount - $amountPaid, 2));
        $progress = $totalAmount > 0 ? round(($amountPaid / $totalAmount) * 100, 1) : 100.0;

        return [
            'id'                  => $this->uuid,
            'uuid'                => $this->uuid,
            'deposit_reference'   => $this->deposit_reference,
            'status'              => $statusVal,
            'status_label'        => $this->status->label(),
            'product_price'       => $this->product_price,
            'deposit_amount'      => $this->deposit_amount,
            'deposit_paid'        => $depositPaid,
            'total_amount'        => $this->total_amount,
            'amount_paid'         => $amountPaid,
            'balance_remaining'   => $totalRemaining,
            'monthly_installment' => $this->monthly_installment,
            'duration_months'     => $this->duration_months,
            'payment_schedule'    => $schedule,
            'interest_rate'       => $this->interest_rate,
            'late_fee'            => $this->late_fee,
            'next_due_date'       => $this->next_due_date,
            'deposit_paid_at'     => $this->deposit_paid_at,
            'completed_at'        => $this->completed_at,
            'defaulted_at'        => $this->defaulted_at,
            'payment_progress'    => $progress,
            'notes'               => $this->notes,
            'created_at'          => $this->created_at,
            'product'             => new ProductResource($this->whenLoaded('product')),
            'installments'        => HirePurchaseInstallmentResource::collection($this->whenLoaded('installments')),
        ];
    }
}
