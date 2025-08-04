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
        ];
    }
}
