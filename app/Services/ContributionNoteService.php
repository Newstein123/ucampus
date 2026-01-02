<?php

namespace App\Services;

use App\Models\Contribution;
use App\Models\ContributionParticipant;
use App\Repositories\ContributionNoteRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;

class ContributionNoteService implements ContributionNoteServiceInterface
{
    public function __construct(
        protected ContributionNoteRepositoryInterface $noteRepository
    ) {}

    /**
     * Check if user is authorized to access notes for a contribution
     * User must be the owner or an accepted collaborator
     */
    protected function canAccessNotes(int $contributionId, int $userId): bool
    {
        $contribution = Contribution::find($contributionId);
        
        if (!$contribution) {
            return false;
        }

        // Check if user is the owner
        if ($contribution->user_id === $userId) {
            return true;
        }

        // Check if user is an accepted collaborator
        return ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->where('status', 'accepted')
            ->exists();
    }

    /**
     * Create a new note
     */
    public function create(array $data)
    {
        $contributionId = $data['contribution_id'];
        $userId = $data['user_id'];

        if (!$this->canAccessNotes($contributionId, $userId)) {
            throw new AuthorizationException('You are not authorized to add notes to this contribution.');
        }

        return $this->noteRepository->create($data);
    }

    /**
     * List notes for a contribution
     */
    public function list(int $contributionId, int $userId, int $perPage = 10, int $page = 1)
    {
        if (!$this->canAccessNotes($contributionId, $userId)) {
            throw new AuthorizationException('You are not authorized to view notes for this contribution.');
        }

        return $this->noteRepository->findByContribution($contributionId, $perPage, $page);
    }

    /**
     * Update a note (only the author can update)
     */
    public function update(int $id, int $userId, array $data)
    {
        $note = $this->noteRepository->findById($id);

        if (!$note) {
            throw new \Exception('Note not found.');
        }

        // Only note author can update
        if ($note->user_id !== $userId) {
            throw new AuthorizationException('You can only edit your own notes.');
        }

        return $this->noteRepository->update($id, $data);
    }

    /**
     * Delete a note (only the author can delete)
     */
    public function delete(int $id, int $userId)
    {
        $note = $this->noteRepository->findById($id);

        if (!$note) {
            throw new \Exception('Note not found.');
        }

        // Only note author can delete
        if ($note->user_id !== $userId) {
            throw new AuthorizationException('You can only delete your own notes.');
        }

        return $this->noteRepository->delete($id);
    }
}
