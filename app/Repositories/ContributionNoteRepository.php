<?php

namespace App\Repositories;

use App\Models\ContributionNote;

class ContributionNoteRepository implements ContributionNoteRepositoryInterface
{
    public function create(array $data)
    {
        return ContributionNote::create($data);
    }

    public function findByContribution(int $contributionId, int $perPage = 10, int $page = 1)
    {
        return ContributionNote::with(['user'])
            ->where('contribution_id', $contributionId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findById(int $id)
    {
        return ContributionNote::with(['user', 'contribution'])->find($id);
    }

    public function update(int $id, array $data)
    {
        $note = $this->findById($id);
        if ($note) {
            $note->update($data);
        }
        return $note;
    }

    public function delete(int $id)
    {
        $note = $this->findById($id);
        if ($note) {
            return $note->delete();
        }
        return false;
    }
}
