<?php

namespace App\Repositories;

use App\Models\ContributionEditRequest;
use App\Models\ContributionParticipant;
use Illuminate\Database\Eloquent\Collection;

class EditRequestRepository implements EditRequestRepositoryInterface
{
    public function create(array $data, array $relations = []): ContributionEditRequest
    {
        $editRequest = ContributionEditRequest::create($data);

        if (!empty($relations)) {
            $editRequest->load($relations);
        }

        return $editRequest;
    }

    public function findById(int $id): ?ContributionEditRequest
    {
        return ContributionEditRequest::find($id);
    }

    public function findByIdWithRelations(int $id, array $relations = []): ?ContributionEditRequest
    {
        $query = ContributionEditRequest::query();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id);
    }

    public function listByContribution(int $contributionId, ?string $status = null, ?string $contentKey = null): Collection
    {
        $query = ContributionEditRequest::where('contribution_id', $contributionId)
            ->with(['user:id,name', 'reviewer:id,name']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($contentKey) {
            $query->where('changes->content_key', $contentKey);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function listByUser(int $userId, ?string $status = null): Collection
    {
        $query = ContributionEditRequest::where('user_id', $userId)
            ->with(['contribution:id,title,type', 'reviewer:id,name']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function update(int $id, array $data, array $relations = []): ContributionEditRequest
    {
        $editRequest = ContributionEditRequest::findOrFail($id);
        $editRequest->update($data);

        if (!empty($relations)) {
            $editRequest->load($relations);
        }

        return $editRequest->fresh();
    }

    public function checkIfUserIsActiveCollaborator(int $contributionId, int $userId): bool
    {
        return ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->whereIn('status', ['accepted', 'active'])
            ->exists();
    }
}
