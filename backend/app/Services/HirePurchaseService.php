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
        $user = \App\Models\User::find($userId);
        $isStudentApproved  = $user && $user->student_verification_status === 'approved';
        $isIdentityEligible = $user && in_array($user->identity_verification_status, ['approved', 'pending']);

        if (!$user || (!$isStudentApproved && !$isIdentityEligible)) {
            throw ValidationException::withMessages([
                'verification' => ['You must submit student ID verification or Ghana Card identity verification to request a hire purchase arrangement.'],
            ]);
        }

        return DB::transaction(function () use ($userId, $user, $data) {
            $product = Product::where('id', $data['product_id'])->orWhere('uuid', $data['product_id'])->firstOrFail();

            if (!$product->available_for_hire_purchase) {
                throw ValidationException::withMessages([
                    'product_id' => ['This product is not available for hire purchase.'],
                ]);
            }

            $deposit          = $data['deposit_amount'];
            $durationMonths   = $data['duration_months'];
            $interestRate     = 5; // 5% per month on actual product price
            $maxDuration      = $product->hp_max_duration_months ?? 12;

            if ($durationMonths > $maxDuration) {
                throw ValidationException::withMessages([
                    'duration_months' => ["Maximum allowed duration for this product is {$maxDuration} months."],
                ]);
            }

            if ($deposit < 0 || $deposit > $product->price) {
                throw ValidationException::withMessages([
                    'deposit_amount' => ['Deposit must be between GHS 0.00 and the product price.'],
                ]);
            }

            $totalInterest       = $product->price * ($interestRate / 100) * $durationMonths;
            $totalAmount         = $product->price + $totalInterest;
            $balanceAfterDeposit = max(0, $totalAmount - $deposit);
            $monthlyInstallment  = $balanceAfterDeposit / $durationMonths;
            $nextDueDate         = now()->addMonth();

            $applicantType = $data['applicant_type'] ?? ($user->applicant_type ?? ($isStudentApproved ? 'student' : 'general'));

            $hirePurchase = HirePurchase::create([
                'user_id'             => $userId,
                'product_id'          => $product->id,
                'status'              => HirePurchaseStatus::Pending->value,
                'applicant_type'      => $applicantType,
                'ghana_card_number'   => $data['ghana_card_number'] ?? $user->ghana_card_number,
                'digital_address'     => $data['digital_address'] ?? $user->digital_address,
                'payment_method'      => $data['payment_method'] ?? 'momo',
                'deposit_reference'   => $data['deposit_reference'] ?? ('HIR-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5))),
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
