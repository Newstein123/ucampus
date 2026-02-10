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
        if (!$this->is_sample) {
            $thumbnailUrl = $this->thumbnail_url ? $fileService->getFileUrl($this->thumbnail_url) : null;
        } else {
            $thumbnailUrl = $this->thumbnail_url;
        }

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

        // Prepare participants data - include accepted/active for display, but also include current user's record for status checking
        $currentUser = $request->user();
        $allParticipants = $this->participants;

        // If user is logged in, make sure their participant record is included for status checking
        if ($currentUser) {
            $userParticipant = $this->participants->where('user_id', $currentUser->id)->first();
            if ($userParticipant && !$allParticipants->contains('id', $userParticipant->id)) {
                $allParticipants->push($userParticipant);
            }
        }

        $participantsData = $allParticipants
            ->filter(function ($participant) use ($currentUser) {
                // Show accepted/active for display, but include current user's record regardless of status for checks
                return in_array($participant->status, ['accepted', 'active']) ||
                    ($currentUser && $participant->user_id === $currentUser->id);
            })
            ->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'user_id' => $participant->user_id,
                    'name' => $participant->user->name ?? 'Unknown',
                    'username' => $participant->user->username ?? '',
                    'role_id' => $participant->role_id,
                    'role' => $participant->role ? [
                        'id' => $participant->role->id,
                        'key' => $participant->role->key,
                        'label' => $participant->role->label,
                    ] : null,
                    'joined_at' => $participant->joined_at?->diffForHumans() ?? $participant->created_at?->diffForHumans(),
                    'status' => $participant->status, // Include status for frontend checks
                ];
            })->values()->toArray();

        // Content is already decoded as array due to model cast, but handle both cases
        $content = $this->content;
        if (is_string($content)) {
            $content = json_decode($content, true) ?? [];
        }
        if (!is_array($content)) {
            $content = [];
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'content' => $content,
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

            // Team members with status field included
            'participants' => $participantsData,

            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ],
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
