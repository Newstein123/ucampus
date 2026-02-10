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

    public function bookmark(int $userId, int $contributionId): void;

    public function unbookmark(int $userId, int $contributionId): void;

    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1);

    public function search(array $data = []);

    public function trending(array $data = []);

    public function view(int $id);

    public function viewBySlugOrId(string $identifier);

    public function leaveProject(array $data = []);
}
