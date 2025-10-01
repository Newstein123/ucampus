<?php

namespace App\Repositories;

use App\Models\Contribution;

interface ContributionRepositoryInterface
{
    public function list(array $filters = []);
    public function create(array $data = []);
    public function find(int $id);
    public function findById(int $id): ?array;
    public function update(int $id, array $data = []);
    public function delete(int $id);
    public function addBookmark(int $userId, int $contributionId): void;
    public function removeBookmark(int $userId, int $contributionId): void;
    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1);
}
