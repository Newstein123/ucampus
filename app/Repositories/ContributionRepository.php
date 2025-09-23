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

        // Filter by owner: user_id
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Only public projects unless owned by the requester (handled at service level by user_id)
        if (!isset($filters['user_id']) && isset($filters['is_public'])) {
            $query->where('is_public', (bool) $filters['is_public']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data = [])
    {
        return Contribution::create($data);
    }

    public function findById(int $id): ?array
    {
        $contribution = Contribution::find($id);
        return $contribution ? $contribution->toArray() : null;
    }
    public function update(int $id, array $data = [])
    {
        $contribution = $this->find($id);
        $contribution->update($data);
        return $contribution;
    }

    public function delete(int $id)
    {
        $contribution = $this->find($id);
        return $contribution->delete();
    }
}
