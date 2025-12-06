<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\FileService;

class ContributionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $fileService = app(FileService::class);

        // Get full URLs for files
        $thumbnailUrl = $this->thumbnail_url ? $fileService->getFileUrl($this->thumbnail_url) : null;
        
        // Legacy attachments from JSON field
        $legacyAttachmentUrls = $this->attachments ? $fileService->getFileUrls($this->attachments) : [];
        
        // New attachments from contribution_attachments table
        $newAttachments = $this->contributionAttachments->map(function ($attachment) {
            return [
                'id' => $attachment->id,
                'url' => $attachment->url,
                'path' => $attachment->file_path,
                'name' => $attachment->file_name,
                'type' => $attachment->file_type,
                'size' => $attachment->file_size,
            ];
        })->toArray();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => json_decode($this->content, true),
            'type' => $this->type,
            'tags' => $this->tags->pluck('name')->toArray(),
            'allow_collab' => $this->allow_collab,
            'is_public' => $this->is_public,
            'status' => $this->status,
            'views_count' => $this->views_count,
            'likes_count' => $this->interests_count,
            'comments_count' => $this->discussions()->whereNull('parent_id')->count(),
            'is_interested' => $user ? $this->interests()->where('user_id', $user->id)->exists() : false,
            'is_bookmarked' => $user ? $user->bookmarkedContributions()->where('contribution_id', $this->id)->exists() : false,
            'thumbnail_url' => $thumbnailUrl,
            
            // Legacy attachments (for backward compatibility)
            'attachments' => $legacyAttachmentUrls,
            
            // New attachments with metadata
            'attachment_files' => $newAttachments,
            
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ],
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
