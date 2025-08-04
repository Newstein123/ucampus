<?php

namespace App\Services;

use App\Repositories\TaskRepositoryInterface;
use App\Repositories\CollaborationRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class TaskService implements TaskServiceInterface
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
        private CollaborationRepositoryInterface $collaborationRepository
    ) {}

    public function createTask(int $contributionId, int $userId, array $taskData): array
    {
        try {
            DB::beginTransaction();

            if (!$this->canUserManageTask($contributionId, $userId)) {
                throw new Exception('User does not have permission to create tasks');
            }

            $result = $this->taskRepository->createTask($contributionId, $taskData);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getTasks(int $contributionId): array
    {
        return $this->taskRepository->getTasks($contributionId);
    }

    public function updateTask(int $taskId, int $userId, array $taskData): array
    {
        try {
            DB::beginTransaction();

            $task = $this->taskRepository->getTask($taskId);
            if (!$task) {
                throw new Exception('Task not found');
            }

            if (!$this->canUserManageTask($task['contribution_id'], $userId)) {
                throw new Exception('User does not have permission to update tasks');
            }

            $result = $this->taskRepository->updateTask($taskId, $taskData);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteTask(int $taskId, int $userId): array
    {
        try {
            DB::beginTransaction();

            $task = $this->taskRepository->getTask($taskId);
            if (!$task) {
                throw new Exception('Task not found');
            }

            if (!$this->canUserManageTask($task['contribution_id'], $userId)) {
                throw new Exception('User does not have permission to delete tasks');
            }

            $this->taskRepository->deleteTask($taskId);

            DB::commit();
            return ['message' => 'Task deleted successfully'];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function canUserManageTask(int $contributionId, int $userId): bool
    {
        return $this->collaborationRepository->checkIfUserIsCollaborator($contributionId, $userId) ||
               $this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId);
    }
} 