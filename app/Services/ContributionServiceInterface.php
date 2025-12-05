<?php

namespace App\Services;

interface ContributionServiceInterface
{
    public function list(array $data = []);
    public function create(array $data = []);
    public function interested(array $data = []);
    public function find(int $id);
    public function update(array $data = []);
    public function delete(int $id);
    public function toggleBookmark(int $userId, int $contributionId): array;
    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1);
}
