<?php

namespace App\Services;

use App\Models\HirePurchase;
use App\Models\HirePurchaseInstallment;
use App\Models\Product;
use App\Enums\HirePurchaseStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HirePurchaseService
{
    public function create(int $userId, array $data): HirePurchase
    {
        return DB::transaction(function () use ($userId, $data) {
            $product = Product::findOrFail($data['product_id']);

            if (!$product->available_for_hire_purchase) {
                throw ValidationException::withMessages([
                    'product_id' => ['This product is not available for hire purchase.'],
                ]);
            }

            $deposit          = $data['deposit_amount'];
            $durationMonths   = $data['duration_months'];
            $interestRate     = $data['interest_rate'] ?? 0;
            $totalInterest    = $product->price * ($interestRate / 100);
            $totalAmount      = $product->price + $totalInterest;
            $balanceAfterDeposit = $totalAmount - $deposit;
            $monthlyInstallment  = $balanceAfterDeposit / $durationMonths;
            $nextDueDate         = now()->addMonth();

            $hirePurchase = HirePurchase::create([
                'user_id'             => $userId,
                'product_id'          => $product->id,
                'status'              => HirePurchaseStatus::Active->value,
                'product_price'       => $product->price,
                'deposit_amount'      => $deposit,
                'total_amount'        => $totalAmount,
                'balance_remaining'   => $balanceAfterDeposit,
                'monthly_installment' => $monthlyInstallment,
                'duration_months'     => $durationMonths,
                'interest_rate'       => $interestRate,
                'late_fee'            => $data['late_fee'] ?? 0,
                'next_due_date'       => $nextDueDate,
                'notes'               => $data['notes'] ?? null,
            ]);

            // Generate installment schedule
            for ($i = 1; $i <= $durationMonths; $i++) {
                HirePurchaseInstallment::create([
                    'hire_purchase_id'   => $hirePurchase->id,
                    'installment_number' => $i,
                    'amount_due'         => round($monthlyInstallment, 2),
                    'due_date'           => now()->addMonths($i),
                    'status'             => 'pending',
                ]);
            }

            return $hirePurchase->load('installments');
        });
    }

    public function payInstallment(HirePurchase $hirePurchase, int $installmentId, string $paymentRef): HirePurchaseInstallment
    {
        return DB::transaction(function () use ($hirePurchase, $installmentId, $paymentRef) {
            $installment = $hirePurchase->installments()->findOrFail($installmentId);

            if ($installment->status === 'paid') {
                throw ValidationException::withMessages(['installment' => ['This installment has already been paid.']]);
            }

            $lateFee = $installment->isOverdue() ? $hirePurchase->late_fee : 0;
            $totalPaid = $installment->amount_due + $lateFee;

            $installment->update([
                'amount_paid'       => $totalPaid,
                'late_fee'          => $lateFee,
                'paid_at'           => now(),
                'status'            => 'paid',
                'payment_reference' => $paymentRef,
            ]);

            $newBalance = $hirePurchase->balance_remaining - $installment->amount_due;
            $nextInstallment = $hirePurchase->installments()->where('status', 'pending')->orderBy('due_date')->first();

            $hirePurchase->update([
                'balance_remaining' => max(0, $newBalance),
                'next_due_date'     => $nextInstallment?->due_date,
            ]);

            // Check if all installments paid
            if ($newBalance <= 0) {
                $hirePurchase->update([
                    'status'       => HirePurchaseStatus::Completed->value,
                    'completed_at' => now(),
                ]);
            }

            return $installment->fresh();
        });
    }
}
