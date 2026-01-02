<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
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
            'type' => 'nullable|string|in:idea,question,guide,research,project,tag',
            'q' => 'nullable|string|max:255',
            'sort' => 'nullable|string|in:latest,oldest,most_liked,most_viewed,most_commented',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
