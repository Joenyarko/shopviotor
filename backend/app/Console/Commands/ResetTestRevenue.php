<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\HirePurchase;
use App\Models\TradeRequest;
use App\Models\PreOrder;
use App\Models\LayawayPayment;
use App\Models\Payment;

class ResetTestRevenue extends Command
{
    protected $signature = 'viotor:reset-test-revenue {--force : Force deletion without confirmation}';
    protected $description = 'Clean up unpaid test orders, agreements, and reset corporate analytics to zero';

    public function handle(): int
    {
        $this->info('Reviewing test transaction data...');

        $totalOrders = Order::where('status', '!=', 'cancelled')->count();
        $totalHp = HirePurchase::where('status', '!=', 'cancelled')->count();

        $this->line("Found {$totalOrders} active/test order(s) and {$totalHp} test agreement(s).");

        if (!$this->option('force') && !$this->confirm('Do you want to cancel test orders and agreements to reset analytics to zero?', true)) {
            $this->info('Operation aborted.');
            return Command::SUCCESS;
        }

        // Cancel test orders and clear paid_at
        $cancelledOrders = Order::query()
            ->update([
                'status'              => 'cancelled',
                'paid_at'             => null,
                'cancelled_at'        => now(),
                'cancellation_reason' => 'Test financial reset by administrator',
            ]);

        // Cancel test HP applications
        $cancelledHp = HirePurchase::query()
            ->update([
                'status'          => 'cancelled',
                'deposit_paid_at' => null,
                'notes'           => 'Test application reset by administrator',
            ]);

        \App\Models\HirePurchaseInstallment::query()->update([
            'status'      => 'pending',
            'paid_at'     => null,
            'amount_paid' => 0,
        ]);

        \App\Models\LayawayPayment::query()->delete();
        \App\Models\PreOrder::query()->update([
            'deposit_paid' => 0,
            'status'       => 'pending',
        ]);
        \App\Models\RaffleTicket::query()->delete();
        \App\Models\PaymentTransaction::query()->delete();
        \App\Models\Payment::query()->delete();

        $this->info("Successfully reset {$cancelledOrders} test order(s) and {$cancelledHp} test HP agreement(s).");
        $this->info('Corporate dashboard analytics have been completely reset to GHS 0.00.');

        return Command::SUCCESS;
    }
}

