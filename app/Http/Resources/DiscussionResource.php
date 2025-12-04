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
            'user' => [
                'username' => $this->user->username,
                'avatar' => $this->user->avatar,
            ],
            'content' => $this->content,
            'contribution_id' => $this->contribution_id,
            'is_edited' => $this->is_edited,
            'interests' => $this->interests,
            'parent_id' => $this->parent_id,
            'responses' => DiscussionResource::collection(
                $this->whenLoaded('replies')
            ),
        ];
    }
}
