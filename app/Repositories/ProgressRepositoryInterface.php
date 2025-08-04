<?php

namespace App\Repositories;

interface ProgressRepositoryInterface
{
    public function createProgressUpdate(int $contributionId, int $userId, string $content): array;
    public function getProgressUpdates(int $contributionId): array;
    public function getProgressUpdate(int $updateId): ?array;
} 