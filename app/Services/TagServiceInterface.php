<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Collection;

interface TagServiceInterface
{
    public function getTrending(int $limit = 10): Collection;

    public function search(string $query, int $limit = 20): Collection;
}

