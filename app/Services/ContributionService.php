<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;

class ContributionService implements ContributionServiceInterface
{
    protected $contributionRepository;

    public function __construct(ContributionRepositoryInterface $contributionRepository)
    {
        $this->contributionRepository = $contributionRepository;
    }

    public function list(array $data = [])
    {
        return $this->contributionRepository->list($data);
    }
}
