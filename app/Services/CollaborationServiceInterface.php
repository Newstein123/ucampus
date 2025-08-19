<?php

namespace App\Services;

interface CollaborationServiceInterface
{
    public function sendRequest(int $contributionId, int $userId, string $reason): array;
    public function handleAction(int $status): array;
    public function getList(?int $status = null, ?int $userId = null): array;
}
