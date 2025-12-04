<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscussionResource extends JsonResource
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
            'user' => [
                'username' => $this->user->username,
                'profileName' => $this->user->name,
                'avatar' => $this->user->avatar,
            ],
            'content' => $this->content,
            'contribution_id' => $this->contribution_id,
            'is_edited' => $this->is_edited,
            'interests' => $this->interests ?? 0,
            'parent_id' => $this->parent_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'responses' => DiscussionResource::collection(
                $this->whenLoaded('replies')
            ),
        ];
    }
}
