<?php

namespace App\Repositories;

use App\Models\Order;

class OrderRepository extends BaseRepository
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function getUserOrders(int $userId, int $perPage = 15)
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['items.product', 'payment', 'address'])
            ->latest()
            ->paginate($perPage);
    }

    public function findByOrderNumber(string $orderNumber)
    {
        return $this->model
            ->where('order_number', $orderNumber)
            ->with(['items.product', 'user', 'payment', 'address'])
            ->firstOrFail();
    }

    public function getRevenueStats(string $period = 'month'): array
    {
        $query = $this->model->where('status', 'delivered');

        return [
            'total_revenue' => $query->sum('total'),
            'total_orders'  => $query->count(),
            'avg_order'     => $query->avg('total'),
        ];
    }
}
