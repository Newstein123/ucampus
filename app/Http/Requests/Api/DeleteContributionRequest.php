<?php

namespace App\Http\Requests\Api;

use App\Models\Contribution;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class DeleteContributionRequest extends FormRequest
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

    public function rules(): array
    {
        return [];
    }

    /**
     * Handle a failed authorization attempt.
     */
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
                'message' => 'You are not authorized to delete this contribution',
            ], 403)
        );
    }
}
