<?php

namespace App\Repositories;

use App\Models\Contribution;
use Illuminate\Database\Eloquent\Builder;

class ContributionRepository implements ContributionRepositoryInterface
{
    public function find(int $id)
    {
        return Contribution::with(['participants.role', 'participants.user'])->find($id);
    }

    public function list(array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;
        $page = $filters['page'] ?? 1;

        $query = Contribution::query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by owner: user_id
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Only public projects unless owned by the requester (handled at service level by user_id)
        if (!isset($filters['user_id']) && isset($filters['is_public'])) {
            $query->where('is_public', (bool) $filters['is_public']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data = [])
    {
        return Contribution::create($data);
    }

    public function findById(int $id): ?array
    {
        $contribution = Contribution::find($id);

        return $contribution ? $contribution->toArray() : null;
    }

    public function update(int $id, array $data = [])
    {
        $contribution = $this->find($id);
        $contribution->update($data);

        return $contribution;
    }

    public function delete(int $id)
    {
        $contribution = $this->find($id);

        return $contribution->delete();
    }

    public function addBookmark(int $userId, int $contributionId): void
    {
        $contribution = Contribution::findOrFail($contributionId);
        $contribution->bookmarkedBy()->syncWithoutDetaching([$userId]);
    }

    public function removeBookmark(int $userId, int $contributionId): void
    {
        $contribution = Contribution::findOrFail($contributionId);
        $contribution->bookmarkedBy()->detach([$userId]);
    }

    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1)
    {
        $query = Contribution::with(['user', 'tags'])
            ->whereHas('bookmarkedBy', function (Builder $q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('type', $type);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function search(array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;
        $page = $filters['page'] ?? 1;

        $query = Contribution::query()
            ->with(['user', 'tags'])
            ->where('is_public', true);

        // Filter by type
        if (isset($filters['type']) && !empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Freeword search (searches title and content)
        if (isset($filters['q']) && !empty($filters['q'])) {
            $searchTerm = '%' . $filters['q'] . '%';
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('content', 'like', $searchTerm);
            });
        }

        // Sort options
        $sort = $filters['sort'] ?? 'latest';
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'most_liked':
                $query->withCount('interests')
                    ->orderBy('interests_count', 'desc');
                break;
            case 'most_viewed':
                $query->orderBy('views_count', 'desc');
                break;
            case 'most_commented':
                $query->withCount(['discussions' => function ($q) {
                    $q->whereNull('parent_id');
                }])->orderBy('discussions_count', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function trending(array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;
        $page = $filters['page'] ?? 1;

        $query = Contribution::query()
            ->with(['user', 'tags'])
            ->where('is_public', true)
            ->withCount('interests')
            ->withCount(['discussions' => function ($q) {
                $q->whereNull('parent_id');
            }]);

        // Filter by type
        if (isset($filters['type']) && !empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Hacker News-style trending algorithm:
        // score = (likes + views * 0.1 + comments * 2) / (hours_since_created + 2) ^ 1.5
        // Using raw SQL for performance (PostgreSQL compatible)
        $query->selectRaw('
            contributions.*,
            (
                (COALESCE((SELECT COUNT(*) FROM contribution_interest WHERE contribution_id = contributions.id), 0)) +
                (contributions.views_count * 0.1) +
                (COALESCE((SELECT COUNT(*) FROM discussions WHERE contribution_id = contributions.id AND parent_id IS NULL AND deleted_at IS NULL), 0) * 2)
            ) / POWER(EXTRACT(EPOCH FROM (NOW() - contributions.created_at)) / 3600 + 2, 1.5) AS trending_score
        ')
            ->orderBy('trending_score', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}
