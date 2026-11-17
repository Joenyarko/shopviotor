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

        $unpaidOrders = Order::whereNull('paid_at')->where('status', '!=', 'cancelled')->count();
        $unpaidHp = HirePurchase::whereNull('deposit_paid_at')->where('status', '!=', 'cancelled')->count();

        $this->line("Found {$unpaidOrders} unpaid test order(s) and {$unpaidHp} pending test agreement(s).");

        if (!$this->option('force') && !$this->confirm('Do you want to cancel unpaid test orders and agreements to reset analytics to zero?', true)) {
            $this->info('Operation aborted.');
            return Command::SUCCESS;
        }

        // Cancel unpaid orders
        $cancelledOrders = Order::whereNull('paid_at')
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => 'Test order reset',
            ]);

        // Cancel unpaid HP applications
        $cancelledHp = HirePurchase::whereNull('deposit_paid_at')
            ->update([
                'status' => 'cancelled',
                'notes' => 'Test application reset',
            ]);

        $this->info("Successfully cancelled {$cancelledOrders} test order(s) and {$cancelledHp} test HP agreement(s).");
        $this->info('Corporate dashboard analytics have been reset.');

        return Command::SUCCESS;
    }
}
