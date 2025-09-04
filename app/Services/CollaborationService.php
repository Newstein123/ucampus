<?php

namespace App\Services;

use App\Repositories\CollaborationRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class CollaborationService implements CollaborationServiceInterface
{
    public function __construct(
        private CollaborationRepositoryInterface $collaborationRepository
    ) {}

    public function sendRequest(int $contributionId, int $userId, string $reason): array
    {
        try {
            DB::beginTransaction();

            // Create collaboration request
            $result = $this->collaborationRepository->createRequest([
                'contribution_id' => $contributionId,
                'user_id' => $userId,
                'reason' => $reason,
                'status' => 0 // Pending
            ]);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function handleAction(int $status): array
    {
        try {
            DB::beginTransaction();

            // Update request status
            $result = $this->collaborationRepository->updateRequestStatus($status);

            DB::commit();
            return [
                'status' => $status,
                'message' => $status === 1 ? 'Request approved' : 'Request rejected'
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getList(?int $status = null, ?int $userId = null): array
    {
        try {
            $filters = [];

            if ($status !== null) {
                $filters['status'] = $status;
            }

            if ($userId !== null) {
                $filters['user_id'] = $userId;
            }

            return $this->collaborationRepository->getCollaborations($filters);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
