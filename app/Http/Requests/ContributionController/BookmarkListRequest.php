<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BookmarkListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'per_page' => $this->input('per_page', 10),
            'page' => $this->input('page', 1),
        ]);
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'in:idea,question,guide,research,project'],
            'per_page' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }


}
