<?php

namespace App\Repositories;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    public function __construct(protected Model $model) {}

    public function all(array $with = [], array $filters = [])
    {
        return $this->model->with($with)->get();
    }

    public function find(int|string $id, array $with = [])
    {
        return $this->model->with($with)->findOrFail($id);
    }

    public function findByField(string $field, mixed $value, array $with = [])
    {
        return $this->model->with($with)->where($field, $value)->first();
    }

    public function findByUuid(string $uuid, array $with = [])
    {
        return $this->model->with($with)->where('uuid', $uuid)->firstOrFail();
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int|string $id, array $data): bool
    {
        $record = $this->find($id);
        return $record->update($data);
    }

    public function delete(int|string $id): bool
    {
        $record = $this->find($id);
        return $record->delete();
    }

    public function paginate(int $perPage = 15, array $with = [], array $filters = [])
    {
        $query = $this->model->with($with);

        foreach ($filters as $field => $value) {
            if (!is_null($value)) {
                $query->where($field, $value);
            }
        }

        return $query->latest()->paginate($perPage);
    }
}
