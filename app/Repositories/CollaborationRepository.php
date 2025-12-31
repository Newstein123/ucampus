<?php

namespace App\Repositories;

use App\Models\Contribution;
use App\Models\ContributionParticipant;

class CollaborationRepository implements CollaborationRepositoryInterface
{
    public function createRequest(array $data): array
    {
        $statusMap = [
            0 => 'pending',
            1 => 'accepted',
            2 => 'rejected',
        ];

        // Check if a record already exists (even with 'left' status) due to unique constraint
        $existingParticipant = ContributionParticipant::where('contribution_id', $data['contribution_id'])
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existingParticipant) {
            // If user has left, throw an error
            if ($existingParticipant->status === 'left') {
                throw new \Exception('You have already left this project and cannot rejoin');
            }
            // If there's an existing record with other status (rejected), update it instead
            $existingParticipant->update([
                'join_reason' => $data['join_reason'],
                'role_id' => $data['role_id'],
                'status' => $statusMap[$data['status']] ?? 'pending',
            ]);
            return $existingParticipant->fresh()->toArray();
        }

        // Create new participant record
        $participant = ContributionParticipant::create([
            'contribution_id' => $data['contribution_id'],
            'user_id' => $data['user_id'],
            'join_reason' => $data['join_reason'],
            'role_id' => $data['role_id'],
            'status' => $statusMap[$data['status']] ?? 'pending',
        ]);

        return $participant->toArray();
    }

    public function updateRequestStatus(int $requestId, int $status): array
    {
        $statusMap = [
            0 => 'pending',
            1 => 'accepted',
            2 => 'rejected',
        ];

        $collaborationRequest = ContributionParticipant::findOrFail($requestId);
        $newStatus = $statusMap[$status];
        $collaborationRequest->status = $newStatus;
        
        // Set joined_at when status changes to accepted (user officially joins)
        if ($newStatus === 'accepted' && !$collaborationRequest->joined_at) {
            $collaborationRequest->joined_at = now();
        }
        
        $collaborationRequest->save();

        return $collaborationRequest->fresh()->toArray();
    }

    public function getCollaborations(array $filters): array
    {
        $query = ContributionParticipant::with(['user', 'contribution']);

        if (isset($filters['status'])) {
            $statusMap = [
                0 => 'pending',
                1 => 'accepted',
                2 => 'rejected',
            ];
            $query->where('status', $statusMap[$filters['status']]);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query->get()->toArray();
    }

    public function checkIfUserIsCollaborator(int $contributionId, int $userId): bool
    {
        return ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->whereIn('status', ['active', 'accepted', 'pending'])
            ->exists();
    }

    public function checkIfUserHasLeft(int $contributionId, int $userId): bool
    {
        return ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->where('status', 'left')
            ->exists();
    }

    public function checkIfUserIsOwner(int $contributionId, int $userId): bool
    {
        return Contribution::where('id', $contributionId)
            ->where('user_id', $userId)
            ->exists();
    }
}
