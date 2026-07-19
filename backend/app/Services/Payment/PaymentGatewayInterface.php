<?php

namespace App\Services\Payment;

interface PaymentGatewayInterface
{
    /**
     * Initialize a payment session and return the checkout URL or reference.
     */
    public function initiate(array $data): array;

    /**
     * Verify a payment by reference.
     */
    public function verify(string $reference): array;

    /**
     * Refund a completed payment.
     */
    public function refund(string $reference, float $amount): array;

    /**
     * Get gateway name.
     */
    public function getName(): string;
}
