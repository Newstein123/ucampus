<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
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
            'thumbnail_url' => $this->type === 'idea' ? env('APP_URL') . '/public/' . $this->thumbnail_url : null,
            'likes_count' => $this->likes_count,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ],
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
