<?php

namespace App\Services;

use App\Repositories\TagRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TagService implements TagServiceInterface
{
    public function __construct(
        protected TagRepositoryInterface $tagRepository
    ) {}

    public function getTrending(int $limit = 10): Collection
    {
        try {
            return $this->tagRepository->getTrending($limit);
        } catch (\Exception $e) {
            throw new \Exception('Failed to get trending tags: ' . $e->getMessage());
        }
    }

    public function search(string $query, int $limit = 20): Collection
    {
        try {
            return $this->tagRepository->search($query, $limit);
        } catch (\Exception $e) {
            throw new \Exception('Failed to search tags: ' . $e->getMessage());
        }
    }
}

