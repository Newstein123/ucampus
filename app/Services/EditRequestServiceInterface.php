<?php

namespace App\Services;

use App\Models\ContributionEditRequest;
use Illuminate\Database\Eloquent\Collection;

interface EditRequestServiceInterface
{
    public function create(int $contributionId, int $userId, array $changes, ?string $note = null): ContributionEditRequest;

    public function list(int $contributionId, ?string $status = null, ?string $contentKey = null): Collection;

    public function approve(int $editRequestId, int $reviewerId): ContributionEditRequest;

    public function reject(int $editRequestId, int $reviewerId, ?string $note = null): ContributionEditRequest;

    public function getUserEditRequests(int $userId, ?string $status = null): Collection;
}

