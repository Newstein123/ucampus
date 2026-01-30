<?php

namespace App\Repositories;

use App\Models\ContributionEditRequest;
use Illuminate\Database\Eloquent\Collection;

interface EditRequestRepositoryInterface
{
    public function create(array $data, array $relations = []): ContributionEditRequest;

    public function findById(int $id): ?ContributionEditRequest;

    public function findByIdWithRelations(int $id, array $relations = []): ?ContributionEditRequest;

    public function listByContribution(int $contributionId, ?string $status = null, ?string $contentKey = null): Collection;

    public function listByUser(int $userId, ?string $status = null): Collection;

    public function update(int $id, array $data, array $relations = []): ContributionEditRequest;

    public function checkIfUserIsActiveCollaborator(int $contributionId, int $userId): bool;
}

