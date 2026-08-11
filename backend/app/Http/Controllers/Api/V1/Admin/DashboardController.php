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
    public function comprehensiveStats(\Illuminate\Http\Request $request): JsonResponse
    {
        $filter = $request->query('filter', 'all');
        $startDate = null;
        $endDate = Carbon::now();

        switch ($filter) {
            case 'day':
                $startDate = Carbon::today();
                break;
            case 'week':
                $startDate = Carbon::now()->startOfWeek();
                break;
            case '1month':
                $startDate = Carbon::now()->subDays(30);
                break;
            case '3months':
                $startDate = Carbon::now()->subMonths(3);
                break;
            case '6months':
                $startDate = Carbon::now()->subMonths(6);
                break;
            case '1year':
                $startDate = Carbon::now()->subYear();
                break;
            case 'all':
            default:
                $startDate = null; // No limit
                break;
        }

        // Apply date filters using a closure to keep things clean
        $applyDateFilter = function ($query, $dateColumn = 'created_at') use ($startDate, $endDate) {
            if ($startDate) {
                return $query->whereBetween($dateColumn, [$startDate, $endDate]);
            }
            return $query;
        };

        // 1. Users & Customers
        $totalUsers = $applyDateFilter(User::query())->count();
        $activeCustomers = $applyDateFilter(User::where('role', 'customer'))->count();
        if ($activeCustomers === 0 && $totalUsers > 0) {
            $activeCustomers = $totalUsers;
        }

        // 2. E-Commerce (Orders)
        $ordersCount = $applyDateFilter(Order::where('status', '!=', 'cancelled'))->count();
        $ordersRevenue = (float) $applyDateFilter(Order::where('status', '!=', 'cancelled'))->sum('total');

        // 3. Hire Purchase
        $hpCount = $applyDateFilter(HirePurchase::query())->count();
        $hpDepositRevenue = (float) $applyDateFilter(HirePurchase::where('status', '!=', 'rejected'))->sum('deposit_amount');
        $hpInstallmentRevenue = (float) $applyDateFilter(HirePurchaseInstallment::where('status', 'paid'), 'paid_at')->sum('amount_paid');
        $hpTotalRevenue = $hpDepositRevenue + $hpInstallmentRevenue;

        // 4. Trade Requests
        $tradeCount = $applyDateFilter(TradeRequest::query())->count();
        $tradeValue = (float) $applyDateFilter(TradeRequest::where('status', '!=', 'rejected'))->sum('difference');

        // 5. Pre-Orders
        $preOrderCount = $applyDateFilter(PreOrder::query())->count();
        $preOrderRevenue = (float) $applyDateFilter(PreOrder::where('status', '!=', 'cancelled'))->sum('deposit_paid');

        // 6. Layaway
        $layawayCount = $applyDateFilter(LayawayCard::query())->count();
        $layawayRevenue = (float) $applyDateFilter(LayawayPayment::query())->sum('amount');

        // 7. Raffles
        $raffleCount = $applyDateFilter(Raffle::query())->count();
        $raffleTicketsCount = $applyDateFilter(RaffleTicket::query())->count();
        $raffleRevenue = (float) $applyDateFilter(RaffleTicket::query())->sum('amount_paid');

        // 8. Sell Requests (Corporate Buyouts / Expenses)
        $sellCount = $applyDateFilter(SellRequest::query())->count();
        $sellExpenses = (float) $applyDateFilter(SellRequest::whereIn('status', ['approved', 'completed', 'pickup_scheduled', 'inspecting']))
            ->get()
            ->sum(function ($req) {
                return $req->offered_price ? (float) $req->offered_price : (float) $req->asking_price;
            });

        // Combined Totals
        $grossRevenue = $ordersRevenue + $hpTotalRevenue + $tradeValue + $preOrderRevenue + $layawayRevenue + $raffleRevenue;
        $netProfit = $grossRevenue - $sellExpenses;
        $totalTransactions = $ordersCount + $hpCount + $tradeCount + $preOrderCount + $layawayCount + $raffleTicketsCount;
        $avgTicket = $totalTransactions > 0 ? $grossRevenue / $totalTransactions : 0;

        // 9. Dynamic Trends
        $trends = [];
        if (in_array($filter, ['day', 'week', '1month'])) {
            // Daily trends (last 7 or 30 days)
            $daysToShow = $filter === '1month' ? 30 : 7;
            for ($i = $daysToShow - 1; $i >= 0; $i--) {
                $dayStart = Carbon::today()->subDays($i)->startOfDay();
                $dayEnd = Carbon::today()->subDays($i)->endOfDay();
                $label = $dayStart->format('M d');

                $mOrders = (float) Order::where('status', '!=', 'cancelled')->whereBetween('created_at', [$dayStart, $dayEnd])->sum('total');
                $mHp = (float) HirePurchase::where('status', '!=', 'rejected')->whereBetween('created_at', [$dayStart, $dayEnd])->sum('deposit_amount')
                     + (float) HirePurchaseInstallment::where('status', 'paid')->whereBetween('paid_at', [$dayStart, $dayEnd])->sum('amount_paid');
                $mLayaway = (float) LayawayPayment::whereBetween('created_at', [$dayStart, $dayEnd])->sum('amount');
                $mPreOrder = (float) PreOrder::where('status', '!=', 'cancelled')->whereBetween('created_at', [$dayStart, $dayEnd])->sum('deposit_paid');
                $mRaffle = (float) RaffleTicket::whereBetween('created_at', [$dayStart, $dayEnd])->sum('amount_paid');

                $trends[] = [
                    'label'       => $label,
                    'E-Commerce'  => round($mOrders, 2),
                    'HirePurchase'=> round($mHp, 2),
                    'Layaway'     => round($mLayaway, 2),
                    'PreOrders'   => round($mPreOrder, 2),
                    'Raffles'     => round($mRaffle, 2),
                    'Total'       => round($mOrders + $mHp + $mLayaway + $mPreOrder + $mRaffle, 2),
                ];
            }
        } else {
            // Monthly trends (last 6 or 12 months)
            $monthsToShow = $filter === '1year' || $filter === 'all' ? 12 : 6;
            for ($i = $monthsToShow - 1; $i >= 0; $i--) {
                $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
                $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
                $label = $monthStart->format('M Y');

                $mOrders = (float) Order::where('status', '!=', 'cancelled')->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total');
                $mHp = (float) HirePurchase::where('status', '!=', 'rejected')->whereBetween('created_at', [$monthStart, $monthEnd])->sum('deposit_amount')
                     + (float) HirePurchaseInstallment::where('status', 'paid')->whereBetween('paid_at', [$monthStart, $monthEnd])->sum('amount_paid');
                $mLayaway = (float) LayawayPayment::whereBetween('created_at', [$monthStart, $monthEnd])->sum('amount');
                $mPreOrder = (float) PreOrder::where('status', '!=', 'cancelled')->whereBetween('created_at', [$monthStart, $monthEnd])->sum('deposit_paid');
                $mRaffle = (float) RaffleTicket::whereBetween('created_at', [$monthStart, $monthEnd])->sum('amount_paid');

                $trends[] = [
                    'label'       => $label,
                    'E-Commerce'  => round($mOrders, 2),
                    'HirePurchase'=> round($mHp, 2),
                    'Layaway'     => round($mLayaway, 2),
                    'PreOrders'   => round($mPreOrder, 2),
                    'Raffles'     => round($mRaffle, 2),
                    'Total'       => round($mOrders + $mHp + $mLayaway + $mPreOrder + $mRaffle, 2),
                ];
            }
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
                'trends' => $trends,
            ],
        ]);
    }
}
