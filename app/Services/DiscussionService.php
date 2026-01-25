<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\DiscussionRepositoryInterface;

class DiscussionService implements DiscussionServiceInterface
{
    public function __construct(
        protected DiscussionRepositoryInterface $discussionRepository,
        protected ContributionRepositoryInterface $contributionRepository,
        protected NotificationServiceInterface $notificationService
    ) {}

    public function getAllParentDiscussions(int $id, array $data = [])
    {
        $discussion = $this->discussionRepository->findByContributionId($id, $data);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }

        return $discussion;
    }

    public function getAllResponses(int $id)
    {
        $discussion = $this->discussionRepository->findById($id);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }

        return $discussion;
    }

    public function create(array $data = [])
    {
        try {
            $discussion = $this->discussionRepository->create($data);

            // Send notification to contribution owner when discussion is created
            // Only if the discussion creator is not the contribution owner
            if (isset($data['contribution_id']) && isset($data['user_id'])) {
                $contribution = $this->contributionRepository->find($data['contribution_id']);
                if ($contribution && $contribution->user_id !== $data['user_id']) {
                    // Get relative path for contribution based on type
                    $redirectPath = $this->getContributionRedirectPath($data['contribution_id'], $contribution->type);

                    $this->notificationService->create([
                        'recipient_user_id' => $contribution->user_id,
                        'contribution_id' => $data['contribution_id'],
                        'type' => 'new_discussion',
                        'source_id' => $discussion->id,
                        'source_type' => \App\Models\Discussion::class,
                        'message' => 'Someone started a discussion on your contribution',
                        'redirect_url' => $redirectPath,
                        'sender_user_id' => $data['user_id'],
                    ]);
                }
            }

            return $discussion;
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function update(int $id, array $data = [])
    {
        try {
            $data['content'] = json_encode($data['content']);

            return $this->discussionRepository->update($id, $data);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function delete(int $id)
    {
        try {
            return $this->discussionRepository->delete($id);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function updateInterest(int $id, int $userId): array
    {
        try {
            return $this->discussionRepository->updateInterest($id, $userId);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
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
