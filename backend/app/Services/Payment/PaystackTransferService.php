<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackTransferService
{
    private string $secretKey;
    private string $baseUrl;

    // Standard fallback list of Ghanaian Mobile Money and commercial banks
    private const DEFAULT_GHANA_BANKS = [
        ['name' => 'MTN Mobile Money', 'code' => 'MTN', 'type' => 'mobile_money'],
        ['name' => 'Telecel Cash (Vodafone)', 'code' => 'VOD', 'type' => 'mobile_money'],
        ['name' => 'AT Money (AirtelTigo)', 'code' => 'ATL', 'type' => 'mobile_money'],
        ['name' => 'Absa Bank Ghana', 'code' => '030100', 'type' => 'ghipss'],
        ['name' => 'Access Bank Ghana', 'code' => '280100', 'type' => 'ghipss'],
        ['name' => 'CalBank', 'code' => '140100', 'type' => 'ghipss'],
        ['name' => 'Ecobank Ghana', 'code' => '130100', 'type' => 'ghipss'],
        ['name' => 'Fidelity Bank Ghana', 'code' => '240100', 'type' => 'ghipss'],
        ['name' => 'First Atlantic Bank', 'code' => '170100', 'type' => 'ghipss'],
        ['name' => 'First National Bank Ghana', 'code' => '330100', 'type' => 'ghipss'],
        ['name' => 'GCB Bank', 'code' => '040100', 'type' => 'ghipss'],
        ['name' => 'Guaranty Trust Bank (GTBank)', 'code' => '230100', 'type' => 'ghipss'],
        ['name' => 'National Investment Bank (NIB)', 'code' => '050100', 'type' => 'ghipss'],
        ['name' => 'Republic Bank Ghana', 'code' => '110100', 'type' => 'ghipss'],
        ['name' => 'Societe Generale Ghana', 'code' => '090100', 'type' => 'ghipss'],
        ['name' => 'Stanbic Bank Ghana', 'code' => '190100', 'type' => 'ghipss'],
        ['name' => 'Standard Chartered Bank', 'code' => '020100', 'type' => 'ghipss'],
        ['name' => 'United Bank for Africa (UBA)', 'code' => '060100', 'type' => 'ghipss'],
        ['name' => 'Universal Merchant Bank (UMB)', 'code' => '070100', 'type' => 'ghipss'],
        ['name' => 'Zenith Bank Ghana', 'code' => '120100', 'type' => 'ghipss'],
    ];

    public function __construct()
    {
        $this->secretKey = (string) config('services.paystack.secret_key');
        $this->baseUrl   = (string) config('services.paystack.payment_url', 'https://api.paystack.co');
    }

    /**
     * Get list of supported banks and mobile money networks in Ghana.
     */
    public function getGhanaBanks(): array
    {
        return Cache::remember('paystack_ghana_banks', now()->addDays(7), function () {
            if (empty($this->secretKey)) {
                return self::DEFAULT_GHANA_BANKS;
            }

            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->secretKey,
                ])->timeout(8)->get("{$this->baseUrl}/bank", [
                    'country' => 'ghana',
                    'currency' => 'GHS',
                ]);

                if ($response->successful() && isset($response->json()['data'])) {
                    $banks = $response->json()['data'];
                    if (!empty($banks)) {
                        return array_map(function ($b) {
                            return [
                                'name' => $b['name'],
                                'code' => $b['code'],
                                'type' => $b['type'] ?? (in_array($b['code'], ['MTN', 'VOD', 'ATL']) ? 'mobile_money' : 'ghipss'),
                            ];
                        }, $banks);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Paystack getGhanaBanks request failed, using defaults', ['error' => $e->getMessage()]);
            }

            return self::DEFAULT_GHANA_BANKS;
        });
    }

    /**
     * Resolve account number / Mobile Money phone number to obtain legal account name.
     */
    public function resolveAccount(string $accountNumber, string $bankCode): array
    {
        $cleanAccount = preg_replace('/\D/', '', $accountNumber);

        if (empty($this->secretKey)) {
            // Testing / offline fallback
            return [
                'success'        => true,
                'account_number' => $cleanAccount,
                'account_name'   => 'Verified Account Holder',
                'bank_code'      => $bankCode,
                'is_mock'        => true,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->timeout(10)->get("{$this->baseUrl}/bank/resolve", [
                'account_number' => $cleanAccount,
                'bank_code'      => $bankCode,
            ]);

            $json = $response->json();

            if ($response->successful() && ($json['status'] ?? false)) {
                return [
                    'success'        => true,
                    'account_number' => $json['data']['account_number'] ?? $cleanAccount,
                    'account_name'   => $json['data']['account_name'] ?? 'Account Holder',
                    'bank_code'      => $bankCode,
                ];
            }

            return [
                'success' => false,
                'message' => $json['message'] ?? 'Could not verify account with provider.',
            ];
        } catch (\Throwable $e) {
            Log::error('Paystack account resolution error', ['account' => $cleanAccount, 'bank' => $bankCode, 'error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Account verification service temporarily unavailable.',
            ];
        }
    }

    /**
     * Create a transfer recipient code on Paystack.
     */
    public function createRecipient(string $name, string $accountNumber, string $bankCode, string $type = 'mobile_money'): array
    {
        $cleanAccount = preg_replace('/\D/', '', $accountNumber);

        if (empty($this->secretKey)) {
            return [
                'success'        => true,
                'recipient_code' => 'RCP_MOCK_' . substr(md5($cleanAccount), 0, 12),
                'is_mock'        => true,
            ];
        }

        $type = in_array($bankCode, ['MTN', 'VOD', 'ATL']) ? 'mobile_money' : 'ghipss';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type'  => 'application/json',
            ])->timeout(12)->post("{$this->baseUrl}/transferrecipient", [
                'type'           => $type,
                'name'           => $name,
                'account_number' => $cleanAccount,
                'bank_code'      => $bankCode,
                'currency'       => 'GHS',
                'description'    => "Shop Viotor Vendor - {$name}",
            ]);

            $json = $response->json();

            if ($response->successful() && ($json['status'] ?? false)) {
                return [
                    'success'        => true,
                    'recipient_code' => $json['data']['recipient_code'],
                    'details'        => $json['data'],
                ];
            }

            return [
                'success' => false,
                'message' => $json['message'] ?? 'Failed to register transfer recipient with Paystack.',
            ];
        } catch (\Throwable $e) {
            Log::error('Paystack createRecipient error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Network error connecting to Paystack transfer service.',
            ];
        }
    }

    /**
     * Initiate transfer disbursement directly from Paystack balance.
     */
    public function initiateTransfer(float $amount, string $recipientCode, string $reason, string $reference): array
    {
        // Amount must be in pesewas
        $amountPesewas = (int) round($amount * 100);

        if (empty($this->secretKey)) {
            return [
                'success'       => true,
                'transfer_code' => 'TRF_MOCK_' . strtoupper(substr(md5($reference), 0, 10)),
                'reference'     => $reference,
                'status'        => 'success',
                'is_mock'       => true,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type'  => 'application/json',
            ])->timeout(15)->post("{$this->baseUrl}/transfer", [
                'source'    => 'balance',
                'amount'    => $amountPesewas,
                'recipient' => $recipientCode,
                'reason'    => $reason,
                'reference' => $reference,
                'currency'  => 'GHS',
            ]);

            $json = $response->json();

            if ($response->successful() && ($json['status'] ?? false)) {
                return [
                    'success'       => true,
                    'transfer_code' => $json['data']['transfer_code'] ?? null,
                    'reference'     => $json['data']['reference'] ?? $reference,
                    'status'        => $json['data']['status'] ?? 'pending',
                    'data'          => $json['data'],
                ];
            }

            return [
                'success' => false,
                'message' => $json['message'] ?? 'Paystack transfer request failed.',
            ];
        } catch (\Throwable $e) {
            Log::error('Paystack initiateTransfer error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Transfer service error: ' . $e->getMessage(),
            ];
        }
    }
}

