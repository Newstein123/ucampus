<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EditRequestResource extends JsonResource
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
                'name' => $this->whenLoaded('user') ? $this->user->name : null,
            ],
            'changes' => $this->changes,
            'editor_note' => $this->editor_note,
            'status' => $this->status,
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => $this->whenLoaded('reviewer') && $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'review_note' => $this->review_note,
            'applied_at' => $this->applied_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'contribution' => $this->whenLoaded('contribution') && $this->contribution ? [
                'id' => $this->contribution->id,
                'title' => $this->contribution->title,
                'type' => $this->contribution->type,
            ] : null,
        ];
    }
}

