<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|min:8',
            'content' => 'required',
            'type' => 'required|in:idea,question,guide,research,project',
            'allow_collab' => 'boolean',
            'is_public' => 'boolean',
            'status' => 'required|in:draft,active,completed',
            'thumbnail_url' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf,xls,xlsx|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'required|string'
        ];
    }
}
