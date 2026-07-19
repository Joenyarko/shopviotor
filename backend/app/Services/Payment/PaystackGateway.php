<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackGateway implements PaymentGatewayInterface
{
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->baseUrl   = config('services.paystack.payment_url', 'https://api.paystack.co');
    }

    public function getName(): string
    {
        return 'paystack';
    }

    public function initiate(array $data): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/transaction/initialize", [
            'email'     => $data['email'],
            'amount'    => (int) ($data['amount'] * 100), // Paystack uses kobo/pesewa
            'reference' => $data['reference'],
            'currency'  => $data['currency'] ?? 'GHS',
            'metadata'  => $data['metadata'] ?? [],
            'callback_url' => $data['callback_url'] ?? config('app.url') . '/api/v1/payments/callback/paystack',
        ]);

        $result = $response->json();

        if (!$result['status']) {
            throw new \RuntimeException('Paystack initiation failed: ' . ($result['message'] ?? 'Unknown error'));
        }

        return [
            'authorization_url' => $result['data']['authorization_url'],
            'access_code'       => $result['data']['access_code'],
            'reference'         => $result['data']['reference'],
            'gateway'           => $this->getName(),
        ];
    }

    public function verify(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
        ])->get("{$this->baseUrl}/transaction/verify/{$reference}");

        $result = $response->json();

        if (!$result['status']) {
            throw new \RuntimeException('Paystack verification failed: ' . ($result['message'] ?? 'Unknown error'));
        }

        $data = $result['data'];

        return [
            'success'            => $data['status'] === 'success',
            'reference'          => $data['reference'],
            'gateway_reference'  => $data['id'],
            'amount'             => $data['amount'] / 100,
            'currency'           => $data['currency'],
            'paid_at'            => $data['paid_at'],
            'gateway_status'     => $data['status'],
            'raw'                => $data,
        ];
    }

    public function refund(string $reference, float $amount): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/refund", [
            'transaction' => $reference,
            'amount'      => (int) ($amount * 100),
        ]);

        $result = $response->json();

        if (!$result['status']) {
            throw new \RuntimeException('Paystack refund failed: ' . ($result['message'] ?? 'Unknown error'));
        }

        return ['success' => true, 'data' => $result['data']];
    }
}
