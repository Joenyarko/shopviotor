<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelExpiredOrders extends Command
{
    protected $signature = 'orders:cancel-expired {--hours=24 : Hours after which unpaid pending orders are cancelled}';

    protected $description = 'Cancel orders still pending and unpaid after 24 hours and restore their stock';

    public function handle(OrderService $orderService): int
    {
        $hours  = max(1, (int) $this->option('hours'));
        $cutoff = now()->subHours($hours);

        $expiredOrders = Order::with('items')
            ->where('status', OrderStatus::Pending->value)
            ->whereNull('paid_at')
            ->where('created_at', '<=', $cutoff)
            ->get();

        $cancelledCount = 0;

        foreach ($expiredOrders as $order) {
            try {
                $orderService->updateStatus(
                    $order,
                    'cancelled',
                    "Auto-cancelled after {$hours} hours without payment"
                );
                $cancelledCount++;
            } catch (\Throwable $e) {
                Log::error("Failed to auto-cancel expired order #{$order->order_number}: " . $e->getMessage());
            }
        }

        $this->info("Auto-cancelled {$cancelledCount} expired unpaid order(s).");

        return self::SUCCESS;
    }
}
