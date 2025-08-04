<?php

namespace App\Repositories;

use App\Models\ProjectTask;

class TaskRepository implements TaskRepositoryInterface
{
    public function createTask(int $contributionId, array $taskData): array
    {
        $task = ProjectTask::create([
            'contribution_id' => $contributionId,
            'title' => $taskData['title'],
            'description' => $taskData['description'] ?? null,
            'due_date' => $taskData['due_date'] ?? null,
            'status' => $taskData['status'] ?? 'to-do'
        ]);

        return $task->toArray();
    }

    public function getTasks(int $contributionId): array
    {
        return ProjectTask::where('contribution_id', $contributionId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function updateTask(int $taskId, array $taskData): array
    {
        $task = ProjectTask::findOrFail($taskId);
        $task->update($taskData);
        
        return $task->toArray();
    }

    public function deleteTask(int $taskId): bool
    {
        $task = ProjectTask::findOrFail($taskId);
        return $task->delete();
    }

    public function getTask(int $taskId): ?array
    {
        $task = ProjectTask::find($taskId);
        return $task ? $task->toArray() : null;
    }
} 