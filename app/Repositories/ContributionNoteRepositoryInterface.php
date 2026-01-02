<?php

namespace App\Repositories;

interface ContributionNoteRepositoryInterface
{
    public function create(array $data);

    public function findByContribution(int $contributionId, int $perPage = 10, int $page = 1);

    public function findById(int $id);

    public function update(int $id, array $data);

    public function delete(int $id);
}
