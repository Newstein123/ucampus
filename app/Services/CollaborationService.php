<?php

namespace App\Services;

use App\Repositories\CollaborationRepositoryInterface;
use App\Repositories\ContributionRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class CollaborationService implements CollaborationServiceInterface
{
    public function __construct(
        private CollaborationRepositoryInterface $collaborationRepository,
        private ContributionRepositoryInterface $contributionRepository
    ) {}

    public function requestCollaboration(int $contributionId, int $userId, string $message): array
    {
        try {
            DB::beginTransaction();

            $contribution = $this->contributionRepository->findById($contributionId);
            if (!$contribution || !$contribution['allow_collab']) {
                throw new Exception('Contribution does not allow collaboration');
            }

            if ($this->collaborationRepository->checkIfUserIsCollaborator($contributionId, $userId)) {
                throw new Exception('User is already a collaborator');
            }

            if ($this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId)) {
                throw new Exception('Project owner cannot request collaboration');
            }

            $result = $this->collaborationRepository->createCollaborationRequest($contributionId, $userId, $message);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getCollaborators(int $contributionId): array
    {
        return $this->collaborationRepository->getCollaborators($contributionId);
    }

    public function getAllCollaborationRequests(int $contributionId): array
    {
        return $this->collaborationRepository->getAllCollaborationRequests($contributionId);
    }

    public function approveCollaboration(int $contributionId, int $userId): array
    {
        try {
            DB::beginTransaction();

            $this->collaborationRepository->updateCollaborationStatus($contributionId, $userId, 'active');

            DB::commit();
            return ['message' => 'Collaboration approved successfully'];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function rejectCollaboration(int $contributionId, int $userId): array
    {
        try {
            DB::beginTransaction();

            $this->collaborationRepository->updateCollaborationStatus($contributionId, $userId, 'rejected');

            DB::commit();
            return ['message' => 'Collaboration rejected successfully'];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function canUserCollaborate(int $contributionId, int $userId): bool
    {
        return $this->collaborationRepository->checkIfUserIsCollaborator($contributionId, $userId) ||
               $this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId);
    }

    public function canUserManageCollaboration(int $contributionId, int $userId): bool
    {
        return $this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId);
    }
} 