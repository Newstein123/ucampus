<?php

namespace App\Repositories;

use App\Models\Contribution;
use App\Models\ContributionParticipant;
use App\Models\User;

class CollaborationRepository implements CollaborationRepositoryInterface
{
    public function createCollaborationRequest(int $contributionId, int $userId, string $message): array
    {
        $participant = ContributionParticipant::create([
            'contribution_id' => $contributionId,
            'user_id' => $userId,
            'reason' => $message,
            'status' => 'pending'
        ]);

        return $participant->toArray();
    }

    public function getCollaborators(int $contributionId): array
    {
        return ContributionParticipant::with('user')
            ->where('contribution_id', $contributionId)
            ->whereIn('status', ['active', 'accepted'])
            ->get()
            ->toArray();
    }

    public function getAllCollaborationRequests(int $contributionId): array
    {
        return ContributionParticipant::with('user')
            ->where('contribution_id', $contributionId)
            ->get()
            ->toArray();
    }

    public function updateCollaborationStatus(int $contributionId, int $userId, string $status): bool
    {
        return ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->update(['status' => $status]);
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