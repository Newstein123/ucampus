<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\TagRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class ContributionService implements ContributionServiceInterface
{
    public function __construct(
        protected ContributionRepositoryInterface $contributionRepository,
        protected TagRepositoryInterface $tagRepository,
        protected NotificationServiceInterface $notificationService,
        protected FileService $fileService
    ) {}

    public function list(array $data = [])
    {
        // When listing for the public feed (no user_id filter), only show public contributions
        // This ensures drafts (non-public) only appear in the user's own hub
        if (!isset($data['user_id'])) {
            $data['is_public'] = true;
        }

        return $this->contributionRepository->list($data);
    }

    public function create(array $data = [])
    {
        try {
            $data['content'] = json_encode($data['content']);

            if (isset($data['allow_collab'])) {
                $data['allow_collab'] = filter_var($data['allow_collab'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['is_public'])) {
                $data['is_public'] = filter_var($data['is_public'], FILTER_VALIDATE_BOOLEAN);
            }

            // Handle file uploads (backward compatibility)
            if (isset($data['thumbnail_url']) && $data['thumbnail_url'] instanceof \Illuminate\Http\UploadedFile) {
                $data['thumbnail_url'] = $this->fileService->uploadFile($data['thumbnail_url'], 'contributions/thumbnails');
            }

            // Extract temp_key for linking attachments before creating contribution
            $tempKey = $data['temp_key'] ?? null;
            unset($data['temp_key']);

            $contribution = $this->contributionRepository->create($data);

            // Handle tags
            if (isset($data['tags'])) {
                $tagIds = $this->tagRepository->createMany($data['tags']);
                $contribution->tags()->attach($tagIds);
            }

            // Link attachment records to contribution using temp_key
            // This allows attachments to be uploaded before the contribution exists
            if (!empty($tempKey)) {
                \App\Models\ContributionAttachment::where('temp_key', $tempKey)
                    ->whereNull('contribution_id')
                    ->update([
                        'contribution_id' => $contribution->id,
                        'temp_key' => null, // Clear temp_key after linking
                    ]);
            }

            // Also handle attachment_ids[] for backward compatibility (e.g., when editing)
            $attachmentIds = $data['attachment_ids'] ?? [];
            unset($data['attachment_ids']);
            if (!empty($attachmentIds) && is_array($attachmentIds)) {
                foreach ($attachmentIds as $attachmentId) {
                    $attachment = \App\Models\ContributionAttachment::find($attachmentId);
                    if ($attachment && !$attachment->contribution_id) {
                        $attachment->update(['contribution_id' => $contribution->id]);
                    }
                }
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

            if (isset($data['content'])) {
                $data['content'] = json_encode($data['content']);
            }

            // Get existing contribution to handle file deletions
            $existingContribution = $this->contributionRepository->find($id);

            // Handle file uploads and deletions
            if (isset($data['thumbnail_url']) && $data['thumbnail_url'] instanceof \Illuminate\Http\UploadedFile) {
                // Delete old thumbnail if exists
                if ($existingContribution->thumbnail_url) {
                    $this->fileService->deleteFile($existingContribution->thumbnail_url);
                }
                $data['thumbnail_url'] = $this->fileService->uploadFile($data['thumbnail_url'], 'contributions/thumbnails');
            } elseif (isset($data['remove_thumbnail']) && $data['remove_thumbnail']) {
                // Handle thumbnail removal
                if ($existingContribution->thumbnail_url) {
                    $this->fileService->deleteFile($existingContribution->thumbnail_url);
                }
                $data['thumbnail_url'] = null;
                unset($data['remove_thumbnail']); // Remove flag from data
            } else {
                // Keep existing thumbnail if not changed
                unset($data['thumbnail_url']);
            }

            // Clean up any remove_thumbnail flag that might still be present
            if (isset($data['remove_thumbnail'])) {
                unset($data['remove_thumbnail']);
            }

            // Handle attachment IDs (for linking uploaded attachments to contribution)
            $attachmentIds = $data['attachment_ids'] ?? [];
            unset($data['attachment_ids']);

            // Handle attachment deletions
            $deleteAttachmentIds = $data['delete_attachment_ids'] ?? [];
            unset($data['delete_attachment_ids']);

            $contribution = $this->contributionRepository->update($id, $data);

            if (isset($data['tags'])) {
                $tagIds = $this->tagRepository->createMany($data['tags']);
                $contribution->tags()->sync($tagIds);
            }

            // Link new attachments to contribution
            if (!empty($attachmentIds) && is_array($attachmentIds)) {
                foreach ($attachmentIds as $attachmentId) {
                    $attachment = \App\Models\ContributionAttachment::find($attachmentId);
                    if ($attachment) {
                        $attachment->update(['contribution_id' => $contribution->id]);
                    }
                }
            }

            // Delete attachments
            if (!empty($deleteAttachmentIds) && is_array($deleteAttachmentIds)) {
                foreach ($deleteAttachmentIds as $attachmentId) {
                    $this->deleteAttachment($attachmentId);
                }
            }

            return $contribution;
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function delete(int $id)
    {
        try {
            // Get contribution for soft delete
            $contribution = $this->contributionRepository->find($id);

            if (!$contribution) {
                throw new \Exception('Contribution not found');
            }

            // Files will be deleted later by scheduled cleanup
            // Soft delete preserves the record for potential recovery

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

                // Send notification only when adding interest and user is not the owner
                if ($contribution->user_id !== $userId) {
                    // Get relative path for contribution based on type
                    $redirectPath = $this->getContributionRedirectPath($data['contribution_id'], $contribution->type);

                    $this->notificationService->create([
                        'recipient_user_id' => $contribution->user_id,
                        'contribution_id' => $data['contribution_id'],
                        'type' => 'interest',
                        'source_id' => $data['contribution_id'],
                        'source_type' => \App\Models\Contribution::class,
                        'message' => 'You have a new interest in your contribution',
                        'redirect_url' => $redirectPath,
                        'sender_user_id' => $data['user_id'],
                    ]);
                }
            }

            return [
                'is_interested' => ! $isInterested,
                'message' => $message,
            ];
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function find(int $id)
    {
        return $this->contributionRepository->find($id);
    }

    public function view(int $id)
    {
        // Use cache to prevent double counting (e.g. strict mode or rapid refreshes)
        // Key: view_lock_IP_ID
        $ip = request()->ip();
        $key = "view_lock_{$ip}_{$id}";

        if (!Cache::has($key)) {
            $this->contributionRepository->incrementViews($id);
            // Lock for 10 seconds
            Cache::put($key, true, 3);
        }

        return $this->contributionRepository->find($id);
    }

    public function toggleBookmark(int $userId, int $contributionId): array
    {
        try {
            $user = \App\Models\User::find($userId);

            // Check if user already has this bookmarked
            $isBookmarked = $user->bookmarkedContributions()
                ->where('contribution_id', $contributionId)
                ->exists();

            if ($isBookmarked) {
                // Remove bookmark
                $this->contributionRepository->removeBookmark($userId, $contributionId);
                $message = 'Bookmark removed successfully';
            } else {
                // Add bookmark
                $this->contributionRepository->addBookmark($userId, $contributionId);
                $message = 'Bookmark added successfully';
            }

            return [
                'is_bookmarked' => !$isBookmarked,
                'message' => $message
            ];
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function bookmark(int $userId, int $contributionId): void
    {
        $this->contributionRepository->addBookmark($userId, $contributionId);
    }

    public function unbookmark(int $userId, int $contributionId): void
    {
        $this->contributionRepository->removeBookmark($userId, $contributionId);
    }

    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1)
    {
        return $this->contributionRepository->listBookmarks($userId, $type, $perPage, $page);
    }

    /**
     * Upload a single attachment file to MinIO and store in database
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param int|null $contributionId Optional contribution ID if updating existing contribution
     * @param string|null $tempKey Optional temp key for linking attachments before contribution creation
     * @return array ['id' => int, 'url' => string, 'path' => string, 'name' => string, 'type' => string, 'size' => int]
     */
    public function uploadAttachment($file, ?int $contributionId = null, ?string $tempKey = null): array
    {
        try {
            // Upload file to MinIO and get relative path
            $relativePath = $this->fileService->uploadFile($file, 'contributions/attachments');

            // Get full URL
            $fullUrl = $this->fileService->getFileUrl($relativePath);

            // Store attachment in database
            $attachment = \App\Models\ContributionAttachment::create([
                'contribution_id' => $contributionId, // Can be null for new contributions
                'temp_key' => $tempKey, // Used to link attachments before contribution creation
                'file_path' => $relativePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return [
                'id' => $attachment->id,
                'url' => $fullUrl,
                'path' => $relativePath,
                'name' => $file->getClientOriginalName(),
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to upload attachment: ' . $e->getMessage());
        }
    }

    /**
     * Delete an attachment by ID
     * 
     * @param int $attachmentId
     * @return bool
     */
    public function deleteAttachment(int $attachmentId): bool
    {
        try {
            $attachment = \App\Models\ContributionAttachment::findOrFail($attachmentId);

            // Delete file from storage
            if ($attachment->file_path) {
                $this->fileService->deleteFile($attachment->file_path);
            }

            // Delete database record
            $attachment->delete();

            return true;
        } catch (\Exception $e) {
            throw new \Exception('Failed to delete attachment: ' . $e->getMessage());
        }
    }

    public function search(array $data = [])
    {
        return $this->contributionRepository->search($data);
    }

    public function trending(array $data = [])
    {
        return $this->contributionRepository->trending($data);
    }

    public function leaveProject(array $data = [])
    {
        try {
            $contributionId = $data['contribution_id'];
            $userId = $data['user_id'];
            $leftReason = $data['left_reason'] ?? null;
            $leftAction = $data['left_action'] ?? 'self';

            // Find the participant
            $participant = \App\Models\ContributionParticipant::where('contribution_id', $contributionId)
                ->where('user_id', $userId)
                ->whereIn('status', ['accepted', 'active'])
                ->first();

            if (!$participant) {
                throw new \Exception('You are not a participant in this project');
            }

            // Check if user is the owner
            $contribution = $this->contributionRepository->find($contributionId);
            $isOwner = $contribution->user_id === $userId;

            // Update participant status
            $participant->update([
                'status' => 'left',
                'left_reason' => $leftReason,
                'left_action' => $leftAction,
                'left_at' => now(),
            ]);

            // Determine message based on action
            if ($leftAction === 'self') {
                $message = 'Left from the project successfully';
            } elseif ($leftAction === 'owner') {
                $message = 'Kicked from the project successfully';
            } else {
                $message = 'Removed from the project successfully';
            }

            // Send notification to project owner if user left themselves
            if ($leftAction === 'self' && !$isOwner) {
                $participantUser = \App\Models\User::find($userId);
                // Get relative path for contribution based on type
                $redirectPath = $this->getContributionRedirectPath($contributionId, $contribution->type);

                $this->notificationService->create([
                    'recipient_user_id' => $contribution->user_id,
                    'contribution_id' => $contributionId,
                    'type' => 'participant_left',
                    'source_id' => $participant->id,
                    'source_type' => \App\Models\ContributionParticipant::class,
                    'message' => ($participantUser ? $participantUser->name : 'A participant') . ' left your project',
                    'redirect_url' => $redirectPath,
                    'sender_user_id' => $userId,
                ]);
            }

            return [
                'message' => $message,
            ];
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
