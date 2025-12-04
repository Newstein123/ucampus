<?php

namespace App\Repositories;

use App\Models\Discussion;
use Illuminate\Support\Facades\Log;

class DiscussionRepository implements DiscussionRepositoryInterface
{
    public function findById(int $id)
    {
        $discussion = Discussion::with(['user', 'replies'])->find($id);
        Log::info('Fetched discussion:', ['discussion' => $discussion]);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }

        return $discussion;
    }

    public function findByContributionId(int $id, array $data = [])
    {
        $limit = $data['per_page'] ?? 10;
        $page = $data['page'] ?? 1;

        return Discussion::with(['user', 'replies'])
            ->where('contribution_id', $id)
            ->whereNull('parent_id')
            ->paginate($limit, ['*'], 'page', $page);
    }

    public function create(array $data = [])
    {
        $discussion = Discussion::create($data);

        if (! $discussion) {
            throw new \Exception('Failed to create discussion');
        }

        $discussion->load(['user', 'replies.user']);

        return $discussion;
    }

    public function update(int $id, array $data = [])
    {
        $discussion = $this->findById($id);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }
        $discussion->update($data);

        return $discussion;
    }

    public function delete(int $id)
    {
        $discussion = $this->findById($id);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }

        return $discussion->delete();
    }

    public function updateInterest(int $id, int $amount = 1 /* give negative value to decrease */)
    {
        $discussion = $this->findById($id);
        if (! $discussion) {
            throw new \Exception('Discussion not found');
        }
        $discussion->increment('interests', $amount);

        return $discussion;
    }
}
