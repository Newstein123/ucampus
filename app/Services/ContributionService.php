<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\TagRepositoryInterface;
use App\Services\NotificationServiceInterface;

class ContributionService implements ContributionServiceInterface
{

    public function __construct(
        protected ContributionRepositoryInterface $contributionRepository,
        protected TagRepositoryInterface $tagRepository,
        protected NotificationServiceInterface $notificationService
    ) {}

    public function list(array $data = [])
    {
        return $this->contributionRepository->list($data);
    }

    public function create(array $data = [])
    {
        try {
            $data['content'] = json_encode($data['content']);
            $contribution = $this->contributionRepository->create($data);
            if (isset($data['tags'])) {
                $tagIds = $this->tagRepository->createMany($data['tags']);
                $contribution->tags()->attach($tagIds);
            }
            return $contribution;
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function update(array $data = [])
    {
        try {
            $id = $data['id'];
            unset($data['id']);
            
            // Find the contribution first
            $contribution = $this->contributionRepository->find($id);
            
            if (!$contribution) {
                throw new \Exception('Contribution not found');
            }

            // Check if the authenticated user owns this contribution
            if ($contribution->user_id !== $data['user_id']) {
                throw new \Exception('Unauthorized to update this contribution');
            }
            
            if (isset($data['content'])) {
                $data['content'] = json_encode($data['content']);
            }
            
            $contribution = $this->contributionRepository->update($id, $data);
            
            if (isset($data['tags'])) {
                $tagIds = $this->tagRepository->createMany($data['tags']);
                $contribution->tags()->sync($tagIds);
            }
            
            return $contribution;
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }    public function delete(int $id)
    {
        try {
            $contribution = $this->contributionRepository->find($id);
            
            if (!$contribution) {
                throw new \Exception('Contribution not found');
            }

            // Check if the authenticated user owns this contribution
            if ($contribution->user_id !== auth()->id()) {
                throw new \Exception('Unauthorized to delete this contribution');
            }

            return $this->contributionRepository->delete($id);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function interested(array $data = [])
    {
        try {
            $contribution = $this->contributionRepository->find($data['contribution_id']);
            $userId = $data['user_id'];

            // Check if user is already interested
            $isInterested = $contribution->interests()->where('user_id', $userId)->exists();

            if ($isInterested) {
                // Remove interest
                $contribution->interests()->detach($userId);
                $message = 'Contribution interest removed successfully';
            } else {
                // Add interest
                $contribution->interests()->attach($userId);
                $message = 'Contribution interest added successfully';

                // Send notification only when adding interest
                $this->notificationService->create([
                    'recipient_user_id' => $contribution->user_id,
                    'contribution_id' => $data['contribution_id'],
                    'type' => 'interest',
                    'source_id' => $data['contribution_id'],
                    'source_type' => \App\Models\Contribution::class,
                    'message' => 'You have a new interest in your contribution',
                    'redirect_url' => route('contributions.show', $data['contribution_id']),
                    'sender_user_id' => $data['user_id'],
                ]);
            }

            return [
                'is_interested' => !$isInterested,
                'message' => $message
            ];
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function find(int $id)
    {
        return $this->contributionRepository->find($id);
    }
}
