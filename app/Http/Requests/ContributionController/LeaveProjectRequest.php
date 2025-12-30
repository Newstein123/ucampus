<?php

namespace App\Http\Requests\ContributionController;

use App\Models\ContributionParticipant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class LeaveProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        $contributionId = $this->input('contribution_id');
        $userId = Auth::id();

        // Check if user is a participant in this contribution
        $participant = ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->whereIn('status', ['accepted', 'active'])
            ->first();

        return $participant !== null;
    }

    public function rules(): array
    {
        return [
            'contribution_id' => 'required|integer|exists:contributions,id',
            'left_reason' => 'nullable|string|max:500',
            'left_action' => 'required|in:self,owner,system',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'You are not authorized to leave this project or you are not a participant',
            ], 403)
        );
    }
}

