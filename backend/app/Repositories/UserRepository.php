<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email)
    {
        return $this->model->where('email', $email)->first();
    }

    public function findById(int $id, array $with = [])
    {
        return $this->model->with($with)->find($id);
    }

    public function findByUuid(string $uuid, array $with = [])
    {
        return $this->model->with($with)->where('uuid', $uuid)->firstOrFail();
    }

    public function getCustomers(int $perPage = 15)
    {
        return $this->model->customers()->with('addresses')->latest()->paginate($perPage);
    }

    public function getAdmins(int $perPage = 15)
    {
        return $this->model->admins()->latest()->paginate($perPage);
    }
}
