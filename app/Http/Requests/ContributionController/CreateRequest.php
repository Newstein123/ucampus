<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;

class CreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|array',
            'type' => 'required|string|in:project,question,idea',
            'allow_collab' => 'boolean',
            'is_public' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'nullable|string|max:255',
            'thumbnail_url' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf,xls,xlsx,doc,docx,txt|max:5120',
        ];
    }
}
