<?php

namespace App\Services\Payment;

class CashGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'cash';
    }

    public function initiate(array $data): array
    {
        return [
            'gateway'      => $this->getName(),
            'reference'    => $data['reference'],
            'amount'       => $data['amount'],
            'currency'     => $data['currency'] ?? 'GHS',
            'instructions' => 'Payment will be collected in-person at pickup/delivery.',
        ];
    }

    public function verify(string $reference): array
    {
        // Cash is manually confirmed by staff
        return [
            'success'        => false,
            'pending_manual' => true,
            'message'        => 'Cash payment requires confirmation by staff.',
            'reference'      => $reference,
        ];
    }

    public function refund(string $reference, float $amount): array
    {
        return [
            'success' => false,
            'message' => 'Cash refunds must be processed in person.',
        ];
    }
}
