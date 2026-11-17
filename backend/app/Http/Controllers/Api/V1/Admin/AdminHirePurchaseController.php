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
                    'student_id_picture_url'       => $hp->user->student_id_picture_url,
                    'student_verification_status'  => $hp->user->student_verification_status,
                    'applicant_type'               => $hp->user->applicant_type,
                    'ghana_card_number'            => $hp->user->ghana_card_number,
                    'ghana_card_front_url'         => $hp->user->ghana_card_front_url,
                    'ghana_card_back_url'          => $hp->user->ghana_card_back_url,
                    'selfie_url'                   => $hp->user->selfie_url,
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
                'interest_rate'       => $hp->interest_rate,
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
                    'student_id_picture_url'       => $hp->user->student_id_picture_url,
                    'student_verification_status'  => $hp->user->student_verification_status,
                    'applicant_type'               => $hp->user->applicant_type,
                    'ghana_card_number'            => $hp->user->ghana_card_number,
                    'ghana_card_front_url'         => $hp->user->ghana_card_front_url,
                    'ghana_card_back_url'          => $hp->user->ghana_card_back_url,
                    'selfie_url'                   => $hp->user->selfie_url,
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
                'interest_rate'       => $hp->interest_rate,
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

        $hp = HirePurchase::where('uuid', $uuid)->firstOrFail();

        \Illuminate\Support\Facades\DB::transaction(function () use ($hp, $request) {
            $txId = $request->transaction_id ?? $hp->deposit_reference ?? ('HIR-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5)));

            $hp->update([
                'status'            => HirePurchaseStatus::Active,
                'deposit_paid_at'   => now(),
                'deposit_reference' => $txId,
                'notes'             => trim(($hp->notes ? $hp->notes . "\n" : "") . ($request->notes ?? "Deposit confirmed by admin via MoMo (Ref: {$txId})")),
            ]);

            $hp->payments()->create([
                'user_id'           => $hp->user_id,
                'amount'            => $hp->deposit_amount,
                'currency'          => 'GHS',
                'method'            => \App\Enums\PaymentMethod::MobileMoney,
                'status'            => \App\Enums\PaymentStatus::Completed,
                'reference'         => $txId,
                'gateway_reference' => $request->transaction_id,
                'notes'             => 'Hire purchase deposit confirmed by admin',
                'paid_at'           => now(),
            ]);
        });

        return response()->json([
            'message' => 'Deposit payment confirmed and agreement activated.',
            'data'    => $hp->fresh(['user', 'product', 'installments']),
        ]);
    }

    public function confirmInstallment(Request $request, string $uuid, int $installmentId): JsonResponse
    {
        $request->validate([
            'transaction_id' => 'nullable|string|max:100',
            'amount_paid'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        $hp = HirePurchase::where('uuid', $uuid)->firstOrFail();
        $installment = $hp->installments()->findOrFail($installmentId);

        \Illuminate\Support\Facades\DB::transaction(function () use ($hp, $installment, $request) {
            $amount = $request->amount_paid ?: $installment->amount_due;
            $txId = $request->transaction_id ?? ('HIR-INST-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(5)));

            $installment->update([
                'status'            => 'paid',
                'amount_paid'       => $amount,
                'paid_at'           => now(),
                'payment_reference' => $txId,
            ]);

            $newBalance = max(0, $hp->balance_remaining - $amount);
            $isComplete = $newBalance <= 0 || $hp->installments()->where('status', '!=', 'paid')->count() === 0;

            $hp->update([
                'balance_remaining' => $newBalance,
                'status'            => $isComplete ? HirePurchaseStatus::Completed : $hp->status,
                'completed_at'      => $isComplete ? now() : $hp->completed_at,
            ]);

            $hp->payments()->create([
                'user_id'           => $hp->user_id,
                'amount'            => $amount,
                'currency'          => 'GHS',
                'method'            => \App\Enums\PaymentMethod::MobileMoney,
                'status'            => \App\Enums\PaymentStatus::Completed,
                'reference'         => $txId,
                'gateway_reference' => $request->transaction_id,
                'notes'             => "Installment #{$installment->installment_number} payment confirmed by admin",
                'paid_at'           => now(),
            ]);
        });

        return response()->json([
            'message' => 'Installment payment confirmed successfully.',
            'data'    => $hp->fresh(['user', 'product', 'installments']),
        ]);
    }
}
