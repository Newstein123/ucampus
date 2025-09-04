<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResponseResource extends JsonResource
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
            'content' => json_decode($this->content),
            'contribution_id' => $this->contribution_id,
            'parent_id' => $this->parent_id,
            'responses' => ResponseResource::collection(
                $this->whenLoaded('replies')
            ),
        ];
    }
}
