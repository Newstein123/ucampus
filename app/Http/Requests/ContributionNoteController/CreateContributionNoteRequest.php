<?php

namespace App\Http\Requests\ContributionNoteController;

use Illuminate\Foundation\Http\FormRequest;

class CreateContributionNoteRequest extends FormRequest
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
            'type' => 'required|string|in:idea,concern,improvement',
            'content_key' => 'nullable|string|in:problem,solution,impact,description,resources,references',
            'note' => 'required|string|max:5000',
        ];
    }
}
