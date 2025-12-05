<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;

class BookmarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'contribution_id' => $this->route('id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'contribution_id' => ['required', 'integer', 'exists:contributions,id'],
        ];
    }
}
