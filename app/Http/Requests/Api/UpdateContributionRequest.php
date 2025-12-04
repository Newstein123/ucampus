<?php

namespace App\Http\Requests\Api;

use App\Models\Contribution;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class UpdateContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $contributionId = $this->route('id');
        $contribution = Contribution::find($contributionId);

        if (! $contribution) {
            return false;
        }

        return $contribution->user_id === Auth::id();
    }

    protected function failedAuthorization()
    {
        $contributionId = $this->route('id');
        $contribution = Contribution::find($contributionId);

        if (! $contribution) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Contribution not found',
                ], 404)
            );
        }

        throw new HttpResponseException(
            response()->json([
                'message' => 'You are not authorized to update this contribution',
            ], 403)
        );
    }

    public function rules(): array
    {
        return [
            'title' => 'required|min:8',
            'content' => 'required',
            'type' => 'required|in:idea,question,guide,research,project',
            'allow_collab' => 'boolean',
            'is_public' => 'boolean',
            'status' => 'required|in:draft,active,completed',
            'thumbnail_url' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf,xls,xlsx,doc,docx,txt|max:5120',
            'tags' => 'nullable|array',
            'tags.*' => 'required|string',
        ];
    }
}
