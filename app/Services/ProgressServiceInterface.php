<?php

namespace App\Services;

interface ProgressServiceInterface
{
    public function createProgressUpdate(int $contributionId, int $userId, string $content): array;
    public function getProgressUpdates(int $contributionId): array;
    public function canUserPostProgress(int $contributionId, int $userId): bool;
} 