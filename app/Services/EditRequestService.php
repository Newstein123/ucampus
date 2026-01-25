<?php

namespace App\Services;

use App\Models\ContributionEditRequest;
use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\EditRequestRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EditRequestService implements EditRequestServiceInterface
{
    public function __construct(
        protected EditRequestRepositoryInterface $editRequestRepository,
        protected ContributionRepositoryInterface $contributionRepository,
        protected NotificationServiceInterface $notificationService
    ) {}

    public function create(int $contributionId, int $userId, array $changes, ?string $note = null): ContributionEditRequest
    {
        try {
            $contribution = $this->contributionRepository->find($contributionId);
            if (!$contribution) {
                throw new \Exception('Contribution not found');
            }

            // Verify user is an active collaborator
            if (!$this->editRequestRepository->checkIfUserIsActiveCollaborator($contributionId, $userId)) {
                throw new \Exception('User is not an active collaborator');
            }

            $editRequest = $this->editRequestRepository->create([
                'contribution_id' => $contributionId,
                'user_id' => $userId,
                'changes' => $changes,
                'editor_note' => $note,
                'status' => 'pending',
            ], ['user']);

            // Get relative path for contribution based on type
            $redirectPath = $this->getContributionRedirectPath($contributionId, $contribution->type);

            // Send notification to project owner
            $this->notificationService->create([
                'recipient_user_id' => $contribution->user_id,
                'contribution_id' => $contributionId,
                'type' => 'edit_request_created',
                'source_id' => $editRequest->id,
                'source_type' => ContributionEditRequest::class,
                'message' => 'A collaborator submitted an edit request for your project',
                'redirect_url' => $redirectPath,
                'sender_user_id' => $userId,
            ]);

            return $editRequest;
        } catch (\Exception $e) {
            Log::error('Failed to create edit request: ' . $e->getMessage());
            throw new \Exception('Failed to create edit request: ' . $e->getMessage());
        }
    }

    public function list(int $contributionId, ?string $status = null, ?string $contentKey = null): Collection
    {
        try {
            return $this->editRequestRepository->listByContribution($contributionId, $status, $contentKey);
        } catch (\Exception $e) {
            Log::error('Failed to list edit requests: ' . $e->getMessage());
            throw new \Exception('Failed to list edit requests: ' . $e->getMessage());
        }
    }

    public function approve(int $editRequestId, int $reviewerId): ContributionEditRequest
    {
        try {
            DB::beginTransaction();

            $editRequest = $this->editRequestRepository->findByIdWithRelations($editRequestId, ['contribution', 'user']);

            if (!$editRequest) {
                throw new \Exception('Edit request not found');
            }

            if ($editRequest->status !== 'pending') {
                throw new \Exception('Edit request is not pending');
            }

            $contribution = $this->contributionRepository->find($editRequest->contribution_id);
            if (!$contribution) {
                throw new \Exception('Contribution not found');
            }

            // Apply changes to contribution
            $changes = $editRequest->changes;
            $contentKey = $changes['content_key'] ?? null;
            $newValue = $changes['new_value'] ?? null;

            if ($contentKey && $newValue !== null) {
                // Ensure content is an array (it's cast as array in model, but handle JSON string case)
                $content = $contribution->content;
                if (is_string($content)) {
                    $content = json_decode($content, true) ?? [];
                }
                if (!is_array($content)) {
                    $content = [];
                }

                // Store old value if not already stored
                if (!isset($changes['old_value'])) {
                    $oldValue = $content[$contentKey] ?? null;
                    // If old value is an array/object, encode it for storage
                    if (is_array($oldValue) || is_object($oldValue)) {
                        $changes['old_value'] = json_encode($oldValue);
                    } else {
                        $changes['old_value'] = $oldValue;
                    }
                }

                // For references, newValue is a JSON string that needs to be parsed
                if ($contentKey === 'references') {
                    $parsedValue = json_decode($newValue, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($parsedValue)) {
                        $content[$contentKey] = $parsedValue;
                    } else {
                        // Fallback: treat as string
                        $content[$contentKey] = $newValue;
                    }
                } else {
                    // For other fields, use the value as-is
                    $content[$contentKey] = $newValue;
                }

                // Update the contribution - content will be automatically JSON encoded by the model cast
                $this->contributionRepository->update($contribution->id, ['content' => $content]);
            }

            // Update edit request with reviewer relationship
            $updatedRequest = $this->editRequestRepository->update($editRequestId, [
                'status' => 'approved',
                'reviewed_by' => $reviewerId,
                'applied_at' => now(),
                'changes' => $changes,
            ], ['reviewer']);

            DB::commit();

            // Get contribution to determine type for redirect path
            $contribution = $this->contributionRepository->find($editRequest->contribution_id);
            $redirectPath = $this->getContributionRedirectPath($editRequest->contribution_id, $contribution?->type);

            // Send notification to requester

            $this->notificationService->create([
                'recipient_user_id' => $editRequest->user_id,
                'contribution_id' => $editRequest->contribution_id,
                'type' => 'edit_request_approved',
                'source_id' => $editRequestId,
                'source_type' => ContributionEditRequest::class,
                'message' => 'Your edit request has been approved',
                'redirect_url' => $redirectPath,
                'sender_user_id' => $reviewerId,
            ]);

            return $updatedRequest;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve edit request: ' . $e->getMessage());
            throw new \Exception('Failed to approve edit request: ' . $e->getMessage());
        }
    }

    public function reject(int $editRequestId, int $reviewerId, ?string $note = null): ContributionEditRequest
    {
        try {
            $editRequest = $this->editRequestRepository->findByIdWithRelations($editRequestId, ['reviewer']);

            if (!$editRequest) {
                throw new \Exception('Edit request not found');
            }

            if ($editRequest->status !== 'pending') {
                throw new \Exception('Edit request is not pending');
            }

            $updatedRequest = $this->editRequestRepository->update($editRequestId, [
                'status' => 'rejected',
                'reviewed_by' => $reviewerId,
                'review_note' => $note,
            ], ['reviewer']);

            // Get contribution to determine type for redirect path
            $contribution = $this->contributionRepository->find($editRequest->contribution_id);
            $redirectPath = $this->getContributionRedirectPath($editRequest->contribution_id, $contribution?->type);

            // Send notification to requester
            $this->notificationService->create([
                'recipient_user_id' => $editRequest->user_id,
                'contribution_id' => $editRequest->contribution_id,
                'type' => 'edit_request_rejected',
                'source_id' => $editRequestId,
                'source_type' => ContributionEditRequest::class,
                'message' => 'Your edit request has been rejected',
                'redirect_url' => $redirectPath,
                'sender_user_id' => $reviewerId,
            ]);

            return $updatedRequest;
        } catch (\Exception $e) {
            Log::error('Failed to reject edit request: ' . $e->getMessage());
            throw new \Exception('Failed to reject edit request: ' . $e->getMessage());
        }
    }

    public function getUserEditRequests(int $userId, ?string $status = null): Collection
    {
        try {
            return $this->editRequestRepository->listByUser($userId, $status);
        } catch (\Exception $e) {
            Log::error('Failed to get user edit requests: ' . $e->getMessage());
            throw new \Exception('Failed to get user edit requests: ' . $e->getMessage());
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
