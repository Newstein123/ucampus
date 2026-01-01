<?php

namespace App\Http\Requests\EditRequestController;

use App\Models\Contribution;
use App\Models\ContributionParticipant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateEditRequest extends FormRequest
{
    public function authorize(): bool
    {
        $contributionId = $this->route('id');
        $contribution = Contribution::find($contributionId);

        if (!$contribution) {
            return false;
        }

        // Only collaborators (accepted/active) can create edit requests
        $userId = Auth::id();
        $isOwner = $contribution->user_id === $userId;
        
        if ($isOwner) {
            return false; // Owner can edit directly, no need for edit request
        }

        // Check if user is an active collaborator
        $participant = ContributionParticipant::where('contribution_id', $contributionId)
            ->where('user_id', $userId)
            ->whereIn('status', ['accepted', 'active'])
            ->first();

        return $participant !== null;
    }

    public function rules(): array
    {
        return [
            'changes' => 'required|array',
            'changes.content_key' => 'required|string',
            'changes.new_value' => 'required|string',
            'changes.old_value' => 'nullable|string',
            'note' => 'nullable|string|max:1000',
        ];
    }

    protected function failedAuthorization()
    {
        $contributionId = $this->route('id');
        $contribution = Contribution::find($contributionId);

        if (!$contribution) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json([
                    'message' => 'Contribution not found',
                ], 404)
            );
        }

        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'message' => 'You must be an approved collaborator to submit edit requests',
            ], 403)
        );
    }
}

