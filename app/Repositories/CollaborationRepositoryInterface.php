<?php

namespace App\Repositories;

interface CollaborationRepositoryInterface
{
    public function createRequest(array $data): array;

    public function updateRequestStatus(int $requestId, int $status): array;

    public function getCollaborations(array $filters): array;

    public function checkIfUserIsCollaborator(int $contributionId, int $userId): bool;

    public function checkIfUserIsOwner(int $contributionId, int $userId): bool;

    public function checkIfUserHasLeft(int $contributionId, int $userId): bool;
}
