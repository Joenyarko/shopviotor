<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\HirePurchase;
use App\Models\HirePurchaseInstallment;
use App\Models\TradeRequest;
use App\Models\PreOrder;
use App\Models\LayawayCard;
use App\Models\LayawayPayment;
use App\Models\Raffle;
use App\Models\RaffleTicket;
use App\Models\SellRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function comprehensiveStats(): JsonResponse
    {
        // 1. Users & Customers
        $totalUsers = User::count();
        $activeCustomers = User::where('role', 'customer')->count();
        if ($activeCustomers === 0 && $totalUsers > 0) {
            $activeCustomers = $totalUsers; // Fallback if roles aren't strictly tagged 'customer'
        }

        // 2. E-Commerce (Orders)
        $ordersQuery = Order::where('status', '!=', 'cancelled');
        $ordersCount = $ordersQuery->count();
        $ordersRevenue = (float) $ordersQuery->sum('total');

        // 3. Hire Purchase
        $hpCount = HirePurchase::count();
        $hpDepositRevenue = (float) HirePurchase::where('status', '!=', 'rejected')->sum('deposit_amount');
        $hpInstallmentRevenue = (float) HirePurchaseInstallment::where('status', 'paid')->sum('amount_paid');
        $hpTotalRevenue = $hpDepositRevenue + $hpInstallmentRevenue;

        // 4. Trade Requests
        $tradeCount = TradeRequest::count();
        $tradeValue = (float) TradeRequest::where('status', '!=', 'rejected')->sum('difference');

        // 5. Pre-Orders
        $preOrderCount = PreOrder::count();
        $preOrderRevenue = (float) PreOrder::where('status', '!=', 'cancelled')->sum('deposit_paid');

        // 6. Layaway
        $layawayCount = LayawayCard::count();
        $layawayRevenue = (float) LayawayPayment::sum('amount');

        // 7. Raffles
        $raffleCount = Raffle::count();
        $raffleTicketsCount = RaffleTicket::count();
        $raffleRevenue = (float) RaffleTicket::sum('amount_paid');

        // 8. Sell Requests (Corporate Buyouts / Expenses)
        $sellCount = SellRequest::count();
        $sellExpenses = (float) SellRequest::whereIn('status', ['approved', 'completed', 'pickup_scheduled', 'inspecting'])
            ->get()
            ->sum(function ($req) {
                return $req->offered_price ? (float) $req->offered_price : (float) $req->asking_price;
            });

        // Combined Totals
        $grossRevenue = $ordersRevenue + $hpTotalRevenue + $tradeValue + $preOrderRevenue + $layawayRevenue + $raffleRevenue;
        $netProfit = $grossRevenue - $sellExpenses;
        $totalTransactions = $ordersCount + $hpCount + $tradeCount + $preOrderCount + $layawayCount + $raffleTicketsCount;
        $avgTicket = $totalTransactions > 0 ? $grossRevenue / $totalTransactions : 0;

        // 9. Monthly Trends (Last 6 Months)
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->format('M');

            $mOrders = (float) Order::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total');

            $mHp = (float) HirePurchase::where('status', '!=', 'rejected')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('deposit_amount')
                + (float) HirePurchaseInstallment::where('status', 'paid')
                ->whereBetween('paid_at', [$monthStart, $monthEnd])
                ->sum('amount_paid');

            $mLayaway = (float) LayawayPayment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $mPreOrder = (float) PreOrder::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('deposit_paid');

            $mRaffle = (float) RaffleTicket::whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount_paid');

            $monthlyTrends[] = [
                'month'       => $monthLabel,
                'E-Commerce'  => round($mOrders, 2),
                'HirePurchase'=> round($mHp, 2),
                'Layaway'     => round($mLayaway, 2),
                'PreOrders'   => round($mPreOrder, 2),
                'Raffles'     => round($mRaffle, 2),
                'Total'       => round($mOrders + $mHp + $mLayaway + $mPreOrder + $mRaffle, 2),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'summary' => [
                    'gross_revenue'      => round($grossRevenue, 2),
                    'total_expenses'     => round($sellExpenses, 2),
                    'net_profit'         => round($netProfit, 2),
                    'total_transactions' => $totalTransactions,
                    'active_users'       => $activeCustomers,
                    'total_users'        => $totalUsers,
                    'avg_ticket'         => round($avgTicket, 2),
                ],
                'models' => [
                    'ecommerce' => [
                        'name'    => 'E-Commerce Orders',
                        'count'   => $ordersCount,
                        'revenue' => round($ordersRevenue, 2),
                    ],
                    'hire_purchase' => [
                        'name'    => 'Hire Purchase',
                        'count'   => $hpCount,
                        'revenue' => round($hpTotalRevenue, 2),
                    ],
                    'trade' => [
                        'name'    => 'Device Trade-In',
                        'count'   => $tradeCount,
                        'revenue' => round($tradeValue, 2),
                    ],
                    'pre_orders' => [
                        'name'    => 'Pre-Orders',
                        'count'   => $preOrderCount,
                        'revenue' => round($preOrderRevenue, 2),
                    ],
                    'layaway' => [
                        'name'    => 'Layaway Plans',
                        'count'   => $layawayCount,
                        'revenue' => round($layawayRevenue, 2),
                    ],
                    'raffles' => [
                        'name'    => 'Raffles & Draws',
                        'count'   => $raffleCount,
                        'tickets' => $raffleTicketsCount,
                        'revenue' => round($raffleRevenue, 2),
                    ],
                    'sell_requests' => [
                        'name'     => 'Corporate Buyouts',
                        'count'    => $sellCount,
                        'expenses' => round($sellExpenses, 2),
                    ],
                ],
                'monthly_trends' => $monthlyTrends,
            ],
        ]);
    }
}
