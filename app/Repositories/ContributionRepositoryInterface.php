<?php

namespace App\Repositories;

use App\Models\Contribution;

interface ContributionRepositoryInterface
{
    public function list(array $filters = []);
    public function create(array $data = []);
    public function find(int $id);
}
