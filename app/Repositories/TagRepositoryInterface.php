<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface TagRepositoryInterface
{
    public function createMany(array $data = []);

    public function getTrending(int $limit = 10): Collection;

    public function search(string $query, int $limit = 20): Collection;
}
