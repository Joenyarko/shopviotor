<?php

namespace App\Services;

use App\Events\PaymentReceived;
use App\Models\Payment;
use App\Repositories\PaymentRepository;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(private PaymentRepository $paymentRepo) {}

    public function initiate(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $payment = $this->paymentRepo->create([
                'payable_type' => $data['payable_type'],
                'payable_id'   => $data['payable_id'],
                'user_id'      => $data['user_id'],
                'reference'    => 'VTR-' . strtoupper(Str::random(12)),
                'method'       => $data['method'],
                'gateway'      => $data['method'],
                'amount'       => $data['amount'],
                'currency'     => $data['currency'] ?? 'GHS',
                'status'       => 'pending',
            ]);

            $gateway = PaymentGatewayFactory::make($data['method']);

            $gatewayData = $gateway->initiate([
                'email'      => $data['email'],
                'amount'     => $data['amount'],
                'reference'  => $payment->reference,
                'currency'   => $data['currency'] ?? 'GHS',
                'phone'      => $data['phone'] ?? null,
                'provider'   => $data['provider'] ?? null,
                'subaccount' => $data['subaccount'] ?? null,
                'metadata'   => [
                    'payment_id'   => $payment->id,
                    'payable_type' => $data['payable_type'],
                    'payable_id'   => $data['payable_id'],
                ],
            ]);

            $payment->update(['gateway' => $gateway->getName()]);

            return array_merge($gatewayData, ['payment_id' => $payment->id, 'reference' => $payment->reference]);
        });
    }

    public function verify(string $reference): Payment
    {
        return DB::transaction(function () use ($reference) {
            // SECURITY: Lock the row to prevent race conditions / double-processing
            $payment = Payment::where('reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            // SECURITY: Idempotency guard — if already completed, return early without re-firing events
            $currentStatus = $payment->status instanceof \BackedEnum ? $payment->status->value : (string) $payment->status;
            if ($currentStatus === 'completed') {
                Log::info('Payment already verified, skipping re-processing.', ['reference' => $reference]);
                return $payment->load(['payable', 'transactions']);
            }

            $gateway = PaymentGatewayFactory::make($payment->method->value);
            $result  = $gateway->verify($reference);

            // SECURITY: Verify the gateway amount AND currency match the expected payment
            if ($result['success']) {
                $expectedCurrency = strtoupper((string) ($payment->currency ?? 'GHS'));
                $receivedCurrency = strtoupper((string) ($result['currency'] ?? ''));
                if ($receivedCurrency && $receivedCurrency !== $expectedCurrency) {
                    Log::error('SECURITY: Payment currency mismatch detected!', [
                        'reference'         => $reference,
                        'expected_currency' => $expectedCurrency,
                        'received_currency' => $receivedCurrency,
                    ]);
                    throw new \UnexpectedValueException(
                        "Payment currency mismatch: expected {$expectedCurrency}, gateway returned {$receivedCurrency}."
                    );
                }

                $amountDiff = abs((float) $result['amount'] - (float) $payment->amount);
                if ($amountDiff > 0.01) { // Allow 1 pesewa tolerance for floating point
                    Log::error('SECURITY: Payment amount mismatch detected!', [
                        'reference'       => $reference,
                        'expected_amount' => $payment->amount,
                        'received_amount' => $result['amount'],
                    ]);
                    throw new \UnexpectedValueException(
                        "Payment amount mismatch: expected GHS {$payment->amount}, gateway returned GHS {$result['amount']}."
                    );
                }
            }

            $payment->update([
                'gateway_reference' => $result['gateway_reference'] ?? null,
                'gateway_status'    => $result['gateway_status'] ?? null,
                'gateway_response'  => $result['raw'] ?? null,
                'status'            => $result['success'] ? 'completed' : 'failed',
                'paid_at'           => $result['success'] ? now() : null,
            ]);

            $payment->transactions()->create([
                'type'                   => 'charge',
                'status'                 => $result['success'] ? 'success' : 'failed',
                'amount'                 => $payment->amount,
                'currency'              => $payment->currency,
                'gateway_transaction_id' => $result['gateway_reference'] ?? null,
                'response'               => $result['raw'] ?? null,
            ]);

            if ($result['success']) {
                // Fulfill synchronously inside the transaction so order status updates immediately
                app(\App\Listeners\FulfillPaymentFulfillment::class)->handle(new PaymentReceived($payment));
            }

            return $payment->fresh(['payable', 'transactions']);
        });
    }

    public function refund(Payment $payment, float $amount): array
    {
        $gateway = PaymentGatewayFactory::make($payment->method->value);
        $result  = $gateway->refund($payment->reference, $amount);

        if ($result['success']) {
            $payment->update(['status' => 'refunded']);
            $payment->transactions()->create([
                'type'    => 'refund',
                'status'  => 'success',
                'amount'  => $amount,
                'currency' => $payment->currency,
                'response' => $result['data'] ?? null,
            ]);
        }

        return $result;
    }

    public function adminConfirm(Payment $payment, int $adminId): Payment
    {
        $alreadyCompleted = false;

        DB::transaction(function () use ($payment, &$alreadyCompleted) {
            // SECURITY: Reload with row lock inside transaction so concurrent admin clicks cannot fulfill twice
            $locked = Payment::where('id', $payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $currentStatus = $locked->status instanceof \BackedEnum ? $locked->status->value : (string) $locked->status;
            if ($currentStatus === 'completed') {
                $alreadyCompleted = true;
                return;
            }

            $locked->update([
                'status'         => \App\Enums\PaymentStatus::Completed,
                'paid_at'        => now(),
                'gateway_status' => 'manually_confirmed',
            ]);

            // Fulfill synchronously (ticks layaway boxes, confirms order, etc.)
            app(\App\Listeners\FulfillPaymentFulfillment::class)->handle(new PaymentReceived($locked));
        });

        if ($alreadyCompleted) {
            return $payment->fresh();
        }

        // Audit trail (non-fatal if activity_log table is not migrated)
        try {
            if (function_exists('activity')) {
                activity('payment')
                    ->performedOn($payment)
                    ->withProperties([
                        'admin_id'     => $adminId,
                        'confirmed_at' => now()->toISOString(),
                        'action'       => 'manual_admin_confirmation',
                    ])
                    ->log('Admin manually confirmed payment');
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Payment audit log skipped: ' . $e->getMessage());
        }

        // Send receipt email (non-fatal if mail/queue is not configured)
        try {
            app(\App\Listeners\SendPaymentReceipt::class)->handle(new PaymentReceived($payment->fresh()));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Payment receipt email skipped: ' . $e->getMessage());
        }

        return $payment->fresh();
    }
}
