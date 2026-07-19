<?php

namespace App\Services;

use App\Events\PaymentReceived;
use App\Models\Payment;
use App\Repositories\PaymentRepository;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Support\Facades\DB;
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
                'email'     => $data['email'],
                'amount'    => $data['amount'],
                'reference' => $payment->reference,
                'currency'  => $data['currency'] ?? 'GHS',
                'phone'     => $data['phone'] ?? null,
                'provider'  => $data['provider'] ?? null,
                'metadata'  => [
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
            $payment = $this->paymentRepo->findByReference($reference);
            $gateway = PaymentGatewayFactory::make($payment->method->value);
            $result  = $gateway->verify($reference);

            $payment->update([
                'gateway_reference' => $result['gateway_reference'] ?? null,
                'gateway_status'    => $result['gateway_status'] ?? null,
                'gateway_response'  => $result['raw'] ?? null,
                'status'            => $result['success'] ? 'completed' : 'failed',
                'paid_at'           => $result['success'] ? now() : null,
            ]);

            $payment->transactions()->create([
                'type'    => 'charge',
                'status'  => $result['success'] ? 'success' : 'failed',
                'amount'  => $payment->amount,
                'currency' => $payment->currency,
                'gateway_transaction_id' => $result['gateway_reference'] ?? null,
                'response' => $result['raw'] ?? null,
            ]);

            if ($result['success']) {
                event(new PaymentReceived($payment));
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

    public function adminConfirm(Payment $payment): Payment
    {
        $payment->update([
            'status'  => 'completed',
            'paid_at' => now(),
            'gateway_status' => 'manually_confirmed',
        ]);

        event(new PaymentReceived($payment));

        return $payment->fresh();
    }
}
