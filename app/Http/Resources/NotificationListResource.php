<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class NotificationListResource extends JsonResource
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
            'sender' => $this->sender ? [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'avatar' => $this->sender->avatar ? Storage::url($this->sender->avatar) : null,
            ] : null,
            'recipient' => $this->recipient ? [
                'id' => $this->recipient->id,
                'name' => $this->recipient->name,
                'avatar' => $this->recipient->avatar ? Storage::url($this->recipient->avatar) : null,
            ] : null,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'redirect_url' => $this->redirect_url,
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}
