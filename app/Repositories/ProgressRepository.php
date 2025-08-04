<?php

namespace App\Repositories;

use App\Models\ProgressUpdate;

class ProgressRepository implements ProgressRepositoryInterface
{
    public function createProgressUpdate(int $contributionId, int $userId, string $content): array
    {
        $update = ProgressUpdate::create([
            'contribution_id' => $contributionId,
            'user_id' => $userId,
            'content' => $content
        ]);

        return $update->load('user')->toArray();
    }

    public function getProgressUpdates(int $contributionId): array
    {
        return ProgressUpdate::with('user')
            ->where('contribution_id', $contributionId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function getProgressUpdate(int $updateId): ?array
    {
        $update = ProgressUpdate::with('user')->find($updateId);
        return $update ? $update->toArray() : null;
    }
} 