<?php

namespace App\Repositories;

interface TaskRepositoryInterface
{
    public function createTask(int $contributionId, array $taskData): array;
    public function getTasks(int $contributionId): array;
    public function updateTask(int $taskId, array $taskData): array;
    public function deleteTask(int $taskId): bool;
    public function getTask(int $taskId): ?array;
} 