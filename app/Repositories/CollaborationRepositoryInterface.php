<?php

namespace App\Repositories;

interface CollaborationRepositoryInterface
{
    public function createCollaborationRequest(int $contributionId, int $userId, string $message): array;
    public function getCollaborators(int $contributionId): array;
    public function getAllCollaborationRequests(int $contributionId): array;
    public function updateCollaborationStatus(int $contributionId, int $userId, string $status): bool;
    public function checkIfUserIsCollaborator(int $contributionId, int $userId): bool;
    public function checkIfUserIsOwner(int $contributionId, int $userId): bool;
} 