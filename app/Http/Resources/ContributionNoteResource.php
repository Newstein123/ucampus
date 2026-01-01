<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributionNoteResource extends JsonResource
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
            'contribution_id' => $this->contribution_id,
            'user' => [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'profileName' => $this->user->profile_name,
                'avatar' => $this->user->avatar,
            ],
            'type' => $this->type,
            'note' => $this->note,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
