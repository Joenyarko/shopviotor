<?php

namespace App\Services\Payment;

class BankTransferGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'bank_transfer';
    }

    public function initiate(array $data): array
    {
        // Return bank account details for manual transfer
        return [
            'gateway'      => $this->getName(),
            'reference'    => $data['reference'],
            'bank_name'    => config('services.bank_transfer.bank_name', 'GCB Bank'),
            'account_name' => config('services.bank_transfer.account_name', 'Viotor Ltd'),
            'account_number' => config('services.bank_transfer.account_number', '1234567890'),
            'amount'       => $data['amount'],
            'currency'     => $data['currency'] ?? 'GHS',
            'instructions' => 'Please use your order reference as payment description.',
        ];
    }

    public function verify(string $reference): array
    {
        // Admin manually verifies bank transfer payments
        return [
            'success'         => false,
            'pending_manual'  => true,
            'message'         => 'Bank transfer requires manual verification by admin.',
            'reference'       => $reference,
        ];
    }

    public function refund(string $reference, float $amount): array
    {
        // Manual refund process
        return [
            'success' => false,
            'message' => 'Bank transfer refunds must be processed manually.',
        ];
    }
}
