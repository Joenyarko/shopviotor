<?php

namespace App\Services\Payment;

use App\Enums\PaymentMethod;
use InvalidArgumentException;

class PaymentGatewayFactory
{
    public static function make(string|PaymentMethod $method): PaymentGatewayInterface
    {
        $driver = $method instanceof PaymentMethod
            ? $method->driver()
            : $method;

        return match($driver) {
            'paystack'      => new PaystackGateway(),
            'mobile_money'  => new MobileMoneyGateway(),
            'bank_transfer' => new BankTransferGateway(),
            'cash'          => new CashGateway(),
            default         => throw new InvalidArgumentException("Unsupported payment gateway: {$driver}"),
        };
    }
}
