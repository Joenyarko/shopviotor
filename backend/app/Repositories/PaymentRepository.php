<?php

namespace App\Repositories;

use App\Models\Payment;

class PaymentRepository extends BaseRepository
{
    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function findByReference(string $reference)
    {
        return $this->model->where('reference', $reference)->firstOrFail();
    }

    public function getUserPayments(int $userId, int $perPage = 15)
    {
        return $this->model
            ->where('user_id', $userId)
            ->with('transactions')
            ->latest()
            ->paginate($perPage);
    }
}
