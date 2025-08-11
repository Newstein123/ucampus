<?php

namespace App\Services;

interface TaskServiceInterface
{
    public function createTask(int $contributionId, int $userId, array $taskData): array;
    public function getTasks(int $contributionId): array;
    public function updateTask(int $taskId, int $userId, array $taskData): array;
    public function deleteTask(int $taskId, int $userId): array;
    public function canUserManageTask(int $contributionId, int $userId): bool;
} 