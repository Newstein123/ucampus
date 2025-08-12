<?php

namespace App\Repositories;

use App\Models\Contribution;

class ContributionRepository implements ContributionRepositoryInterface
{
    public function find(int $id)
    {
        return Contribution::find($id);
    }

    public function list(array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;
        $page = $filters['page'] ?? 1;

        $query = Contribution::query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data = [])
    {
        return Contribution::create($data);
    }

    public function update(int $id, array $data = [])
    {
        $contribution = $this->find($id);
        if (!$contribution) {
            throw new \Exception('Contribution not found');
        }
        $contribution->update($data);
        return $contribution;
    }

    public function delete(int $id)
    {
        $contribution = $this->find($id);
        if (!$contribution) {
            throw new \Exception('Contribution not found');
        }
        return $contribution->delete();
    }
}
