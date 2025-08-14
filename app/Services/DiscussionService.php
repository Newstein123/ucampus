<?php

namespace App\Services;

use App\Repositories\DiscussionRepositoryInterface;

class DiscussionService implements DiscussionServiceInterface
{

    public function __construct(
        protected DiscussionRepositoryInterface $discussionRepository
    ) {}

    public function getAllParentDiscussions(int $id)
    {
        $discussion = $this->discussionRepository->findByContributionId($id);
        if (!$discussion) {
            throw new \Exception('Discussion not found');
        }
        return $discussion;
    }

    public function getAllResponses(int $id)
    {
        $discussion = $this->discussionRepository->findById($id);
        if (!$discussion) {
            throw new \Exception('Discussion not found');
        }

        return $discussion;
    }

    public function create(array $data = [])
    {
        try {
            $discussion = $this->discussionRepository->create($data);
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
}
