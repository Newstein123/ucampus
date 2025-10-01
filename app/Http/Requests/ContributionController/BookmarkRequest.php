<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = Auth::user();
            if (!$user) {
                return;
            }

            $contributionId = (int) $this->input('contribution_id');

            $hasBookmark = $user->bookmarkedContributions()
                ->where('contribution_id', $contributionId)
                ->exists();

            if ($this->isMethod('post') && $hasBookmark) {
                $validator->errors()->add('contribution_id', 'Contribution already bookmarked.');
            }

            if ($this->isMethod('delete') && !$hasBookmark) {
                $validator->errors()->add('contribution_id', 'Bookmark does not exist.');
            }
        });
    }
}


