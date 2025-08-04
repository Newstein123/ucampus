<?php

namespace App\Services;

use App\Repositories\ProgressRepositoryInterface;
use App\Repositories\CollaborationRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class ProgressService implements ProgressServiceInterface
{
    public function __construct(
        private ProgressRepositoryInterface $progressRepository,
        private CollaborationRepositoryInterface $collaborationRepository
    ) {}

    public function createProgressUpdate(int $contributionId, int $userId, string $content): array
    {
        try {
            DB::beginTransaction();

            if (!$this->canUserPostProgress($contributionId, $userId)) {
                throw new Exception('User does not have permission to post progress updates');
            }

            $result = $this->progressRepository->createProgressUpdate($contributionId, $userId, $content);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getProgressUpdates(int $contributionId): array
    {
        return $this->progressRepository->getProgressUpdates($contributionId);
    }

    public function canUserPostProgress(int $contributionId, int $userId): bool
    {
        return $this->collaborationRepository->checkIfUserIsCollaborator($contributionId, $userId) ||
               $this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId);
    }
} 