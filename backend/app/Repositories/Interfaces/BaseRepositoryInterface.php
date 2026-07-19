<?php

namespace App\Repositories\Interfaces;

interface BaseRepositoryInterface
{
    public function all(array $with = [], array $filters = []);
    public function find(int|string $id, array $with = []);
    public function findByField(string $field, mixed $value, array $with = []);
    public function create(array $data);
    public function update(int|string $id, array $data): bool;
    public function delete(int|string $id): bool;
    public function paginate(int $perPage = 15, array $with = [], array $filters = []);
}
