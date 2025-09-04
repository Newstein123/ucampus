<?php

namespace App\Repositories;

use App\Models\Contribution;
use App\Models\ContributionParticipant;
use App\Models\User;

class CollaborationRepository implements CollaborationRepositoryInterface
{
    public function createRequest(array $data): array
    {
        $statusMap = [
            0 => 'pending',
            1 => 'accepted',
            2 => 'rejected'
        ];

        $participant = ContributionParticipant::create([
            'contribution_id' => $data['contribution_id'],
            'user_id' => $data['user_id'],
            'reason' => $data['reason'],
            'status' => $statusMap[$data['status']] ?? 'pending'
        ]);

        return $participant->toArray();
    }

    public function updateRequestStatus(int $status): array
    {
        $statusMap = [
            0 => 'pending',
            1 => 'accepted',
            2 => 'rejected'
        ];

        $collaborationRequest = ContributionParticipant::findOrFail(request('request_id'));
        $collaborationRequest->status = $statusMap[$status];
        $collaborationRequest->save();

        return $collaborationRequest->toArray();
    }

    public function getCollaborations(array $filters): array
    {
        $query = ContributionParticipant::with(['user', 'contribution']);

        if (isset($filters['status'])) {
            $statusMap = [
                0 => 'pending',
                1 => 'accepted',
                2 => 'rejected'
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
            ->whereIn('status', ['active', 'accepted'])
            ->exists();
    }

    public function checkIfUserIsOwner(int $contributionId, int $userId): bool
    {
        return Contribution::where('id', $contributionId)
            ->where('user_id', $userId)
            ->exists();
    }
}
