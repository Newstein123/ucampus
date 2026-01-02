<?php

namespace App\Services;

interface ContributionNoteServiceInterface
{
    public function create(array $data);

    public function list(int $contributionId, int $userId, int $perPage = 10, int $page = 1);

    public function update(int $id, int $userId, array $data);

    public function delete(int $id, int $userId);
}
