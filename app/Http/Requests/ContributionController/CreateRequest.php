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
            'allow_collab' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'tags' => 'nullable|array',
            'tags.*' => 'nullable|string|max:255',
            'thumbnail_url' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            
            // Temp key for linking attachments uploaded before contribution creation
            'temp_key' => 'nullable|string|max:255',
            
            // Support both old and new attachment methods
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf,xls,xlsx,doc,docx,txt|max:5120',
            
            // New attachment_paths for pre-uploaded files
            'attachment_paths' => 'nullable|array|max:5',
            'attachment_paths.*.path' => 'required|string',
            'attachment_paths.*.name' => 'required|string',
            'attachment_paths.*.type' => 'nullable|string',
            'attachment_paths.*.size' => 'nullable|integer',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string booleans to actual booleans for FormData
        if ($this->has('is_public')) {
            $value = $this->input('is_public');
            if (is_string($value)) {
                $this->merge([
                    'is_public' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($value === '1' || $value === 'true' || $value === 'on' || $value === 'yes'),
                ]);
            }
        }

        if ($this->has('allow_collab')) {
            $value = $this->input('allow_collab');
            if (is_string($value)) {
                $this->merge([
                    'allow_collab' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($value === '1' || $value === 'true' || $value === 'on' || $value === 'yes'),
                ]);
            }
        }
    }
}
