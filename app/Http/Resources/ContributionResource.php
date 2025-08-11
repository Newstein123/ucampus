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
        $user = $request->user();

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
            'is_interested' => $user ? $this->interests()->where('user_id', $user->id)->exists() : false,
            'thumbnail_url' => $this->type === 'idea' ? env('APP_URL') . '/public/' . $this->thumbnail_url : null,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ],
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
