<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;

class MobileMoneyGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'mobile_money';
    }

    public function initiate(array $data): array
    {
        // Paystack supports Mobile Money (MTN, Vodafone) via charge API
        $secretKey = config('services.paystack.secret_key');
        $baseUrl   = config('services.paystack.payment_url', 'https://api.paystack.co');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $secretKey,
            'Content-Type'  => 'application/json',
        ])->post("{$baseUrl}/charge", [
            'email'          => $data['email'],
            'amount'         => (int)($data['amount'] * 100),
            'currency'       => $data['currency'] ?? 'GHS',
            'reference'      => $data['reference'],
            'mobile_money'   => [
                'phone'    => $data['phone'],
                'provider' => $data['provider'] ?? 'mtn', // mtn, vodafone, tigo
            ],
        ]);

        $result = $response->json();

        if (!$result['status']) {
            throw new \RuntimeException('Mobile money charge failed: ' . ($result['message'] ?? 'Unknown'));
        }

        return [
            'gateway'    => $this->getName(),
            'reference'  => $data['reference'],
            'status'     => $result['data']['status'],
            'message'    => $result['data']['display_text'] ?? 'Awaiting OTP confirmation.',
            'raw'        => $result['data'],
        ];
    }

    public function verify(string $reference): array
    {
        $secretKey = config('services.paystack.secret_key');
        $baseUrl   = config('services.paystack.payment_url', 'https://api.paystack.co');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $secretKey,
        ])->get("{$baseUrl}/transaction/verify/{$reference}");

        $result = $response->json();

        if (!$result['status']) {
            throw new \RuntimeException('Mobile money verification failed: ' . ($result['message'] ?? 'Unknown'));
        }

        $data = $result['data'];

        return [
            'success'           => $data['status'] === 'success',
            'reference'         => $data['reference'],
            'gateway_reference' => $data['id'],
            'amount'            => $data['amount'] / 100,
            'currency'          => $data['currency'],
            'paid_at'           => $data['paid_at'],
            'gateway_status'    => $data['status'],
            'raw'               => $data,
        ];
    }

    public function refund(string $reference, float $amount): array
    {
        $secretKey = config('services.paystack.secret_key');
        $baseUrl   = config('services.paystack.payment_url', 'https://api.paystack.co');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $secretKey,
            'Content-Type'  => 'application/json',
        ])->post("{$baseUrl}/refund", [
            'transaction' => $reference,
            'amount'      => (int)($amount * 100),
        ]);

        $result = $response->json();

        return ['success' => $result['status'], 'data' => $result['data'] ?? null];
    }
}
