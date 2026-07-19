<?php

namespace App\Repositories\Interfaces;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email);
    public function findByUuid(string $uuid, array $with = []);
    public function getCustomers(int $perPage = 15);
    public function getAdmins(int $perPage = 15);
}
