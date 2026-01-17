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
                'id' => $this->whenLoaded('user') ? $this->user->id : $this->user_id,
                'username' => $this->whenLoaded('user') ? $this->user->username : null,
                'profileName' => $this->whenLoaded('user') ? $this->user->name : null,
                'avatar' => $this->whenLoaded('user') ? $this->user->avatar : null,
            ],
            'type' => $this->type,
            'content_key' => $this->content_key,
            'status' => $this->status ?? 'pending',
            'note' => $this->note,
            'resolved_by' => $this->resolved_by,
            'resolver' => $this->whenLoaded('resolver') && $this->resolver ? [
                'id' => $this->resolver->id,
                'name' => $this->resolver->name,
            ] : null,
            'resolved_at' => $this->resolved_at ? $this->resolved_at->format('c') : null,
            'created_at' => $this->created_at ? $this->created_at->format('c') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('c') : null,
        ];
    }
}
