<?php

namespace App\Repositories;

use App\Models\Contribution;

class ContributionRepository implements ContributionRepositoryInterface
{
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
}
