<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HirePurchase;
use App\Enums\HirePurchaseStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHirePurchaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hirePurchases = HirePurchase::with(['user', 'product'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        $data = collect($hirePurchases->items())->map(function ($hp) {
            return [
                'uuid'                => $hp->uuid,
                'applicant_type'      => $hp->applicant_type ?? ($hp->user->applicant_type ?? 'student'),
                'ghana_card_number'   => $hp->ghana_card_number ?? $hp->user->ghana_card_number,
                'digital_address'     => $hp->digital_address ?? $hp->user->digital_address,
                'payment_method'      => $hp->payment_method ?? 'momo',
                'deposit_reference'   => $hp->deposit_reference,
                'user'                => [
                    'name'                         => $hp->user->first_name . ' ' . $hp->user->last_name,
                    'email'                        => $hp->user->email,
                    'phone'                        => $hp->user->phone_number,
                    'student_id'                   => $hp->user->student_id,
                    'student_name'                 => $hp->user->student_name,
                    'student_course'               => $hp->user->student_course,
                    'student_level'                => $hp->user->student_level,
                    'student_id_picture_url'       => \App\Models\User::normalizeAssetUrl($hp->user->student_id_picture_url),
                    'student_verification_status'  => $hp->user->student_verification_status,
                    'applicant_type'               => $hp->user->applicant_type,
                    'ghana_card_number'            => $hp->user->ghana_card_number,
                    'ghana_card_front_url'         => \App\Models\User::normalizeAssetUrl($hp->user->ghana_card_front_url),
                    'ghana_card_back_url'          => \App\Models\User::normalizeAssetUrl($hp->user->ghana_card_back_url),
                    'selfie_url'                   => \App\Models\User::normalizeAssetUrl($hp->user->selfie_url),
                    'digital_address'              => $hp->user->digital_address,
                    'occupation'                   => $hp->user->occupation,
                    'employer_name'                => $hp->user->employer_name,
                    'monthly_income'               => $hp->user->monthly_income,
                    'next_of_kin_name'             => $hp->user->next_of_kin_name,
                    'next_of_kin_phone'            => $hp->user->next_of_kin_phone,
                    'next_of_kin_relation'         => $hp->user->next_of_kin_relation,
                    'identity_verification_status' => $hp->user->identity_verification_status,
                ],
                'product'             => [
                    'name'  => $hp->product->name,
                    'image' => $hp->product->primary_image,
                    'price' => $hp->product->price,
                ],
                'status'              => $hp->status,
                'product_price'       => $hp->product_price,
                'deposit_amount'      => $hp->deposit_amount,
                'total_amount'        => $hp->total_amount,
                'balance_remaining'   => $hp->balance_remaining,
                'monthly_installment' => $hp->monthly_installment,
                'duration_months'     => $hp->duration_months,
                'payment_schedule'    => $hp->payment_schedule ?? 'monthly',
                'interest_rate'       => $hp->interest_rate,
                'deposit_paid_at'     => $hp->deposit_paid_at,
                'next_due_date'       => $hp->next_due_date,
                'notes'               => $hp->notes,
                'created_at'          => $hp->created_at,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $hirePurchases->currentPage(),
                'last_page'    => $hirePurchases->lastPage(),
                'total'        => $hirePurchases->total(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $hp = HirePurchase::where('uuid', $uuid)->with(['user', 'product', 'installments'])->firstOrFail();

        return response()->json([
            'data' => [
                'uuid'                => $hp->uuid,
                'applicant_type'      => $hp->applicant_type ?? ($hp->user->applicant_type ?? 'student'),
                'ghana_card_number'   => $hp->ghana_card_number ?? $hp->user->ghana_card_number,
                'digital_address'     => $hp->digital_address ?? $hp->user->digital_address,
                'payment_method'      => $hp->payment_method ?? 'momo',
                'deposit_reference'   => $hp->deposit_reference,
                'user'                => [
                    'name'                         => $hp->user->first_name . ' ' . $hp->user->last_name,
                    'email'                        => $hp->user->email,
                    'phone'                        => $hp->user->phone_number,
                    'student_id'                   => $hp->user->student_id,
                    'student_name'                 => $hp->user->student_name,
                    'student_course'               => $hp->user->student_course,
                    'student_level'                => $hp->user->student_level,
                    'student_id_picture_url'       => \App\Models\User::normalizeAssetUrl($hp->user->student_id_picture_url),
                    'student_verification_status'  => $hp->user->student_verification_status,
                    'applicant_type'               => $hp->user->applicant_type,
                    'ghana_card_number'            => $hp->user->ghana_card_number,
                    'ghana_card_front_url'         => \App\Models\User::normalizeAssetUrl($hp->user->ghana_card_front_url),
                    'ghana_card_back_url'          => \App\Models\User::normalizeAssetUrl($hp->user->ghana_card_back_url),
                    'selfie_url'                   => \App\Models\User::normalizeAssetUrl($hp->user->selfie_url),
                    'digital_address'              => $hp->user->digital_address,
                    'occupation'                   => $hp->user->occupation,
                    'employer_name'                => $hp->user->employer_name,
                    'monthly_income'               => $hp->user->monthly_income,
                    'next_of_kin_name'             => $hp->user->next_of_kin_name,
                    'next_of_kin_phone'            => $hp->user->next_of_kin_phone,
                    'next_of_kin_relation'         => $hp->user->next_of_kin_relation,
                    'identity_verification_status' => $hp->user->identity_verification_status,
                ],
                'product'             => [
                    'name'  => $hp->product->name,
                    'image' => $hp->product->primary_image,
                    'price' => $hp->product->price,
                ],
                'status'              => $hp->status,
                'product_price'       => $hp->product_price,
                'deposit_amount'      => $hp->deposit_amount,
                'total_amount'        => $hp->total_amount,
                'balance_remaining'   => $hp->balance_remaining,
                'monthly_installment' => $hp->monthly_installment,
                'duration_months'     => $hp->duration_months,
                'payment_schedule'    => $hp->payment_schedule ?? 'monthly',
                'interest_rate'       => $hp->interest_rate,
                'deposit_paid_at'     => $hp->deposit_paid_at,
                'next_due_date'       => $hp->next_due_date,
                'notes'               => $hp->notes,
                'created_at'          => $hp->created_at,
                'installments'        => $hp->installments->map(fn($inst) => [
                    'id'                 => $inst->id,
                    'installment_number' => $inst->installment_number,
                    'amount_due'         => $inst->amount_due,
                    'due_date'           => $inst->due_date,
                    'amount_paid'        => $inst->amount_paid,
                    'paid_at'            => $inst->paid_at,
                    'status'             => $inst->status,
                ]),
            ],
        ]);
    }

    public function updateStatus(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $hp = HirePurchase::where('uuid', $uuid)->firstOrFail();
        
        $updates = ['status' => $request->status];
        if ($request->status === 'active' && is_null($hp->deposit_paid_at)) {
            $updates['deposit_paid_at'] = now();
        }

        $hp->update($updates);

        return response()->json([
            'message' => 'Status updated successfully.',
            'status'  => $hp->status,
        ]);
    }

    public function confirmDeposit(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'transaction_id' => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:500',
        ]);

        try {
            $alreadyConfirmed = false;

            $hp = \Illuminate\Support\Facades\DB::transaction(function () use ($uuid, $request, &$alreadyConfirmed) {
                $locked = HirePurchase::where('uuid', $uuid)->lockForUpdate()->firstOrFail();

                if (!is_null($locked->deposit_paid_at)) {
                    $alreadyConfirmed = true;
                    return $locked;
                }

                $rawTxId = trim((string) ($request->transaction_id ?: $locked->deposit_reference ?: ('HIR-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5)))));

                // Ensure payments.reference uniqueness even if the same reference was previously used
                $paymentRef = $rawTxId;
                if (\App\Models\Payment::withTrashed()->where('reference', $paymentRef)->exists()) {
                    $paymentRef = $rawTxId . '-' . strtoupper(\Illuminate\Support\Str::random(4));
                }

                $locked->update([
                    'status'            => HirePurchaseStatus::Active,
                    'deposit_paid_at'   => now(),
                    'deposit_reference' => $rawTxId,
                    'notes'             => trim(($locked->notes ? $locked->notes . "\n" : '') . ($request->notes ?: "Deposit confirmed by admin via MoMo (Ref: {$rawTxId})")),
                ]);

                $locked->payments()->create([
                    'user_id'           => $locked->user_id,
                    'amount'            => $locked->deposit_amount ?? 0,
                    'currency'          => 'GHS',
                    'method'            => \App\Enums\PaymentMethod::MobileMoney,
                    'status'            => \App\Enums\PaymentStatus::Completed,
                    'reference'         => $paymentRef,
                    'gateway_reference' => $request->transaction_id ?: null,
                    'notes'             => 'Hire purchase deposit confirmed by admin',
                    'paid_at'           => now(),
                ]);

                return $locked;
            });

            return response()->json([
                'message' => $alreadyConfirmed
                    ? 'Deposit was already confirmed.'
                    : 'Deposit payment confirmed and agreement activated.',
                'data'    => $hp->fresh(['user', 'product', 'installments']),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('HP confirmDeposit failed: ' . $e->getMessage(), [
                'uuid'  => $uuid,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to confirm deposit: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function confirmInstallment(Request $request, string $uuid, int $installmentId): JsonResponse
    {
        $request->validate([
            'transaction_id' => 'nullable|string|max:100',
            'amount_paid'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        try {
            $alreadyPaid = false;

            $hp = \Illuminate\Support\Facades\DB::transaction(function () use ($uuid, $installmentId, $request, &$alreadyPaid) {
                $locked = HirePurchase::where('uuid', $uuid)->lockForUpdate()->firstOrFail();
                $installment = $locked->installments()->where('id', $installmentId)->lockForUpdate()->firstOrFail();

                if ($installment->status === 'paid') {
                    $alreadyPaid = true;
                    return $locked;
                }

                $amount = $request->amount_paid ?: $installment->amount_due;
                $txId = trim((string) ($request->transaction_id ?: ('HIR-INST-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5)))));
                $paymentRef = $txId;
                if (\App\Models\Payment::withTrashed()->where('reference', $paymentRef)->exists()) {
                    $paymentRef = $txId . '-' . strtoupper(\Illuminate\Support\Str::random(4));
                }

                $installment->update([
                    'status'            => 'paid',
                    'amount_paid'       => $amount,
                    'paid_at'           => now(),
                    'payment_reference' => $txId,
                ]);

                $newBalance = max(0, (float) $locked->balance_remaining - (float) $amount);
                $isComplete = $newBalance <= 0 || $locked->installments()->where('status', '!=', 'paid')->count() === 0;

                $locked->update([
                    'balance_remaining' => $newBalance,
                    'status'            => $isComplete ? HirePurchaseStatus::Completed : $locked->status,
                    'completed_at'      => $isComplete ? now() : $locked->completed_at,
                ]);

                $locked->payments()->create([
                    'user_id'           => $locked->user_id,
                    'amount'            => $amount,
                    'currency'          => 'GHS',
                    'method'            => \App\Enums\PaymentMethod::MobileMoney,
                    'status'            => \App\Enums\PaymentStatus::Completed,
                    'reference'         => $paymentRef,
                    'gateway_reference' => $request->transaction_id ?: null,
                    'notes'             => "Installment #{$installment->installment_number} payment confirmed by admin",
                    'paid_at'           => now(),
                ]);

                return $locked;
            });

            return response()->json([
                'message' => $alreadyPaid
                    ? 'Installment was already marked as paid.'
                    : 'Installment payment confirmed successfully.',
                'data'    => $hp->fresh(['user', 'product', 'installments']),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('HP confirmInstallment failed: ' . $e->getMessage(), [
                'uuid'          => $uuid,
                'installmentId' => $installmentId,
            ]);

            return response()->json([
                'message' => 'Failed to confirm installment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all customer KYC / Student ID applications for Hire Purchase review.
     */
    public function applications(Request $request): JsonResponse
    {
        $users = \App\Models\User::where(function ($q) {
                $q->whereIn('identity_verification_status', ['pending', 'approved', 'rejected'])
                  ->orWhereIn('student_verification_status', ['pending', 'approved', 'rejected']);
            })
            ->latest('updated_at')
            ->get();

        $data = $users->map(function ($u) {
            $isStudent = in_array($u->student_verification_status, ['pending', 'approved', 'rejected'], true)
                && ($u->applicant_type === 'student' || !in_array($u->identity_verification_status, ['pending', 'approved', 'rejected'], true));

            $status = $isStudent
                ? ($u->student_verification_status ?? 'pending')
                : ($u->identity_verification_status ?? 'pending');

            return [
                'uuid'                          => $u->uuid,
                'name'                          => trim($u->first_name . ' ' . $u->last_name),
                'email'                         => $u->email,
                'phone'                         => $u->phone,
                'applicant_type'                => $isStudent ? 'student' : 'general',
                'status'                        => $status,
                'verification_attempts'         => (int) ($u->verification_attempts ?? 0),
                'verification_rejection_reason' => $u->verification_rejection_reason,
                'ghana_card_number'             => $u->ghana_card_number,
                'ghana_card_front_url'          => \App\Models\User::normalizeAssetUrl($u->ghana_card_front_url),
                'ghana_card_back_url'           => \App\Models\User::normalizeAssetUrl($u->ghana_card_back_url),
                'selfie_url'                    => \App\Models\User::normalizeAssetUrl($u->selfie_url),
                'digital_address'               => $u->digital_address,
                'occupation'                    => $u->occupation,
                'employer_name'                 => $u->employer_name,
                'monthly_income'                => $u->monthly_income,
                'next_of_kin_name'              => $u->next_of_kin_name,
                'next_of_kin_phone'             => $u->next_of_kin_phone,
                'next_of_kin_relation'          => $u->next_of_kin_relation,
                'student_id'                    => $u->student_id,
                'student_name'                  => $u->student_name,
                'student_course'                => $u->student_course,
                'student_level'                 => $u->student_level,
                'student_id_picture_url'        => \App\Models\User::normalizeAssetUrl($u->student_id_picture_url),
                'updated_at'                    => $u->updated_at?->toISOString(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Approve a customer's Hire Purchase KYC / Student verification application.
     */
    public function approveApplication(string $userUuid): JsonResponse
    {
        $user = \App\Models\User::where('uuid', $userUuid)->firstOrFail();

        $updates = [];
        if (in_array($user->identity_verification_status, ['pending', 'rejected'], true) || $user->ghana_card_number) {
            $updates['identity_verification_status'] = 'approved';
        }
        if (in_array($user->student_verification_status, ['pending', 'rejected'], true) || $user->student_id) {
            $updates['student_verification_status'] = 'approved';
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_rejection_reason')) {
            $updates['verification_rejection_reason'] = null;
        }

        $user->update($updates);

        return response()->json([
            'message' => 'Application approved. Customer can now configure a Hire Purchase plan and start payments.',
        ]);
    }

    /**
     * Reject a customer's Hire Purchase KYC / Student application with a reason (max 3 retries).
     */
    public function rejectApplication(Request $request, string $userUuid): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $user = \App\Models\User::where('uuid', $userUuid)->firstOrFail();
        $nextAttempts = min(3, (int) ($user->verification_attempts ?? 0) + 1);

        $updates = [];
        if (in_array($user->identity_verification_status, ['pending', 'approved'], true) || $user->ghana_card_number) {
            $updates['identity_verification_status'] = 'rejected';
        }
        if (in_array($user->student_verification_status, ['pending', 'approved'], true) || $user->student_id) {
            $updates['student_verification_status'] = 'rejected';
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_attempts')) {
            $updates['verification_attempts'] = $nextAttempts;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_rejection_reason')) {
            $updates['verification_rejection_reason'] = trim($request->reason);
        }

        $user->update($updates);

        return response()->json([
            'message'               => 'Application rejected with reason.',
            'verification_attempts' => $nextAttempts,
        ]);
    }

    /**
     * Delete/reset a customer's Hire Purchase KYC / Student application (preserves user account).
     */
    public function deleteApplication(string $userUuid): JsonResponse
    {
        $user = \App\Models\User::where('uuid', $userUuid)->firstOrFail();

        $updates = [
            'identity_verification_status' => null,
            'student_verification_status'  => null,
            'ghana_card_number'            => null,
            'ghana_card_front_url'         => null,
            'ghana_card_back_url'          => null,
            'selfie_url'                   => null,
            'student_id'                   => null,
            'student_name'                 => null,
            'student_course'               => null,
            'student_level'                => null,
            'student_id_picture_url'       => null,
        ];
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_attempts')) {
            $updates['verification_attempts'] = 0;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'verification_rejection_reason')) {
            $updates['verification_rejection_reason'] = null;
        }

        $user->update($updates);

        return response()->json([
            'message' => 'Application removed successfully.',
        ]);
    }
}
