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
                'user'                => [
                    'name'  => $hp->user->first_name . ' ' . $hp->user->last_name,
                    'email' => $hp->user->email,
                    'phone' => $hp->user->phone_number,
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
                'user'                => [
                    'name'  => $hp->user->first_name . ' ' . $hp->user->last_name,
                    'email' => $hp->user->email,
                    'phone' => $hp->user->phone_number,
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
        
        $hp->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Status updated successfully.',
            'status'  => $hp->status,
        ]);
    }
}
