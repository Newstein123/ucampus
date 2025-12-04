<?php

namespace App\Http\Requests\DiscussionController;

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

    protected function prepareForValidation()
    {
        if ($this->parent_id) {
            $parent = \App\Models\Discussion::find($this->parent_id);
            if ($parent) {
                $this->merge([
                    'contribution_id' => $parent->contribution_id,
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string',
            'contribution_id' => 'required_without:parent_id|exists:contributions,id',
            'parent_id' => 'nullable|exists:discussions,id',
        ];
    }
}
