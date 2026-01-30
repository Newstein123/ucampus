<?php

namespace App\Http\Requests\ContributionNoteController;

use Illuminate\Foundation\Http\FormRequest;

class ListContributionNotesRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'contribution_id' => 'required|integer|exists:contributions,id',
            'content_key' => 'nullable|string|in:problem,solution,impact,description,resources,references',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
