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
        
        // Legacy attachments from JSON field - convert to same format as new attachments
        $legacyAttachments = [];
        if ($this->attachments && is_array($this->attachments)) {
            foreach ($this->attachments as $path) {
                if (!empty($path)) {
                    $url = $fileService->getFileUrl($path);
                    if ($url) {
                        $legacyAttachments[] = [
                            'id' => null, // Legacy attachments don't have IDs
                            'url' => $url,
                            'path' => $path,
                            'name' => basename($path),
                            'type' => null,
                            'size' => null,
                        ];
                    }
                }
            }
        }
        
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

        // Combine legacy and new attachments into single array
        $allAttachments = array_merge($legacyAttachments, $newAttachments);

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
            
            // Combined attachments array
            'attachments' => $allAttachments,

            // Team members (accepted participants only)
            'participants' => $this->participants
                ->where('status', 'accepted')
                ->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'user_id' => $participant->user_id,
                        'name' => $participant->user->name ?? 'Unknown',
                        'username' => $participant->user->username ?? '',
                        'joined_at' => $participant->joined_at?->diffForHumans() ?? $participant->created_at?->diffForHumans(),
                    ];
                })->values()->toArray(),
            
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ],
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
