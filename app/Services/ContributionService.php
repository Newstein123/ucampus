<?php

namespace App\Services;

use App\Repositories\ContributionRepositoryInterface;
use App\Repositories\TagRepositoryInterface;

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

            // Extract attachment_paths before creating contribution
            $attachmentPaths = $data['attachment_paths'] ?? [];
            unset($data['attachment_paths']);

            $contribution = $this->contributionRepository->create($data);

            // Handle tags
            if (isset($data['tags'])) {
                $tagIds = $this->tagRepository->createMany($data['tags']);
                $contribution->tags()->attach($tagIds);
            }

            // Create attachment records from paths
            if (!empty($attachmentPaths) && is_array($attachmentPaths)) {
                foreach ($attachmentPaths as $attachmentData) {
                    if (is_array($attachmentData) && isset($attachmentData['path'])) {
                        \App\Models\ContributionAttachment::create([
                            'contribution_id' => $contribution->id,
                            'file_path' => $attachmentData['path'],
                            'file_name' => $attachmentData['name'] ?? basename($attachmentData['path']),
                            'file_type' => $attachmentData['type'] ?? null,
                            'file_size' => $attachmentData['size'] ?? null,
                        ]);
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
    }

    public function delete(int $id)
    {
        try {
            // Get contribution to delete associated files
            $contribution = $this->contributionRepository->find($id);

            // Delete associated files
            if ($contribution->thumbnail_url) {
                $this->fileService->deleteFile($contribution->thumbnail_url);
            }

            if ($contribution->attachments) {
                $this->fileService->deleteFiles($contribution->attachments);
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

    public function listBookmarks(int $userId, ?string $type = null, int $perPage = 10, int $page = 1)
    {
        return $this->contributionRepository->listBookmarks($userId, $type, $perPage, $page);
    }

    /**
     * Upload a single attachment file to MinIO
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return array ['url' => string, 'path' => string, 'name' => string, 'type' => string, 'size' => int]
     */
    public function uploadAttachment($file): array
    {
        try {
            // Upload file to MinIO and get relative path
            $relativePath = $this->fileService->uploadFile($file, 'contributions/attachments');

            // Get full URL
            $fullUrl = $this->fileService->getFileUrl($relativePath);

            return [
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
}
