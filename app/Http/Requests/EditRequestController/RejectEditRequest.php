<?php

namespace App\Http\Requests\EditRequestController;

use App\Models\Contribution;
use App\Models\ContributionEditRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class RejectEditRequest extends FormRequest
{
    public function authorize(): bool
    {
        $editRequestId = $this->route('id');
        $editRequest = ContributionEditRequest::find($editRequestId);

        if (!$editRequest) {
            return false;
        }

        $contribution = $editRequest->contribution;
        if (!$contribution) {
            return false;
        }

        // Only owner or admin can reject
        $userId = Auth::id();
        return $contribution->user_id === $userId;
    }

    public function rules(): array
    {
        return [
            'note' => 'nullable|string|max:1000',
        ];
    }

    protected function failedAuthorization()
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'message' => 'You do not have permission to reject this edit request',
            ], 403)
        );
    }
}

