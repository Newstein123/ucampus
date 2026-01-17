<?php

namespace App\Services;

use App\Models\Contribution;
use App\Models\ContributionNote;
use App\Models\ContributionParticipant;
use App\Repositories\ContributionNoteRepositoryInterface;
use App\Repositories\ContributionRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;

class ContributionNoteService implements ContributionNoteServiceInterface
{
    public function __construct(
        protected ContributionNoteRepositoryInterface $noteRepository,
        protected ContributionRepositoryInterface $contributionRepository,
        protected NotificationServiceInterface $notificationService
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
        try {
            $contributionId = $data['contribution_id'];
            $userId = $data['user_id'];

            if (!$this->canAccessNotes($contributionId, $userId)) {
                throw new AuthorizationException('You are not authorized to add notes to this contribution.');
            }

            // Get contribution to check if user is owner
            $contribution = $this->contributionRepository->find($contributionId);
            if (!$contribution) {
                throw new \Exception('Contribution not found.');
            }

            // Set default status to pending if not provided
            if (!isset($data['status'])) {
                $data['status'] = 'pending';
            }

            $note = $this->noteRepository->create($data);

            // Send notification to project owner if note is created by a collaborator (not the owner)
            if ($contribution->user_id !== $userId) {
                // Get relative path for contribution based on type
                $redirectPath = $this->getContributionRedirectPath($contributionId, $contribution->type);

                // Send notification to project owner
                $this->notificationService->create([
                    'recipient_user_id' => $contribution->user_id,
                    'contribution_id' => $contributionId,
                    'type' => 'note_created',
                    'source_id' => $note->id,
                    'source_type' => ContributionNote::class,
                    'message' => 'A collaborator added a note to your project',
                    'redirect_url' => $redirectPath,
                    'sender_user_id' => $userId,
                ]);
            }

            return $note;
        } catch (\Exception $e) {
            Log::error('Failed to create note: ' . $e->getMessage());
            throw new \Exception('Failed to create note: ' . $e->getMessage());
        }
    }

    /**
     * List notes for a contribution
     */
    public function list(int $contributionId, int $userId, int $perPage = 10, int $page = 1, ?string $contentKey = null)
    {
        if (!$this->canAccessNotes($contributionId, $userId)) {
            throw new AuthorizationException('You are not authorized to view notes for this contribution.');
        }

        return $this->noteRepository->findByContribution($contributionId, $perPage, $page, $contentKey);
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

    /**
     * Resolve a note (only owner can resolve)
     */
    public function resolve(int $id, int $userId)
    {
        $note = $this->noteRepository->findById($id);

        if (!$note) {
            throw new \Exception('Note not found.');
        }

        $contribution = Contribution::find($note->contribution_id);
        if (!$contribution) {
            throw new \Exception('Contribution not found.');
        }

        // Only owner can resolve
        if ($contribution->user_id !== $userId) {
            throw new AuthorizationException('Only the project owner can resolve notes.');
        }

        return $this->noteRepository->update($id, [
            'status' => 'resolved',
            'resolved_by' => $userId,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Reject a note (only owner can reject)
     */
    public function reject(int $id, int $userId)
    {
        $note = $this->noteRepository->findById($id);

        if (!$note) {
            throw new \Exception('Note not found.');
        }

        $contribution = Contribution::find($note->contribution_id);
        if (!$contribution) {
            throw new \Exception('Contribution not found.');
        }

        // Only owner can reject
        if ($contribution->user_id !== $userId) {
            throw new AuthorizationException('Only the project owner can reject notes.');
        }

        return $this->noteRepository->update($id, [
            'status' => 'rejected',
            'resolved_by' => $userId,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Get relative redirect path for contribution based on type
     */
    private function getContributionRedirectPath(int $contributionId, ?string $type = null): string
    {
        // If type is provided, use it; otherwise fetch from contribution
        if (!$type) {
            $contribution = $this->contributionRepository->find($contributionId);
            $type = $contribution?->type;
        }

        return match ($type) {
            'project' => "/projects/{$contributionId}",
            'idea' => "/ideas/{$contributionId}",
            'question' => "/questions/{$contributionId}",
            default => "/projects/{$contributionId}", // Default to projects
        };
    }
}
