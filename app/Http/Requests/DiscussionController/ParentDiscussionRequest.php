<?php

namespace App\Http\Requests\DiscussionController;

use Illuminate\Foundation\Http\FormRequest;

class ParentDiscussionRequest extends FormRequest
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
            'contribution_id' => 'required|exists:contributions,id',
            'per_page' => 'integer|nullable',
            'page' => 'integer|nullable',
        ];
    }
}
