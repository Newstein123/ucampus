<?php

namespace App\Http\Requests\ContributionNoteController;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContributionNoteRequest extends FormRequest
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
            'type' => 'sometimes|string|in:idea,concern,improvement',
            'note' => 'sometimes|string|max:5000',
        ];
    }
}
