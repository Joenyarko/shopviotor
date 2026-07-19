<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Card         = 'card';
    case MobileMoney  = 'mobile_money';
    case BankTransfer = 'bank_transfer';
    case Cash         = 'cash';
    case Paystack     = 'paystack';
    case Flutterwave  = 'flutterwave';

    public function label(): string
    {
        return match($this) {
            self::Card         => 'Card',
            self::MobileMoney  => 'Mobile Money',
            self::BankTransfer => 'Bank Transfer',
            self::Cash         => 'Cash',
            self::Paystack     => 'Paystack',
            self::Flutterwave  => 'Flutterwave',
        };
    }

    public function driver(): string
    {
        return match($this) {
            self::Card, self::Paystack => 'paystack',
            self::MobileMoney          => 'mobile_money',
            self::BankTransfer         => 'bank_transfer',
            self::Cash                 => 'cash',
            self::Flutterwave          => 'flutterwave',
        };
    }
}
