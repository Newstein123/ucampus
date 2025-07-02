<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\TagRepositoryInterface;

class ContributionService implements ContributionServiceInterface
{

    public function __construct(
        protected ContributionRepositoryInterface $contributionRepository,
        protected TagRepositoryInterface $tagRepository
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
}
