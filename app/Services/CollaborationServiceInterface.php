<?php

namespace App\Services;

interface CollaborationServiceInterface
{
    public function requestCollaboration(int $contributionId, int $userId, string $message): array;
    public function getCollaborators(int $contributionId): array;
    public function getAllCollaborationRequests(int $contributionId): array;
    public function approveCollaboration(int $contributionId, int $userId): array;
    public function rejectCollaboration(int $contributionId, int $userId): array;
    public function canUserCollaborate(int $contributionId, int $userId): bool;
    public function canUserManageCollaboration(int $contributionId, int $userId): bool;
} 