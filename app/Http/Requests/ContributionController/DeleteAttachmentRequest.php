<?php

namespace App\Http\Requests\ContributionController;

use App\Models\ContributionAttachment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class DeleteAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $attachmentId = $this->route('id');
        $attachment = ContributionAttachment::find($attachmentId);

        if (!$attachment) {
            return false;
        }

        // Check if user owns the contribution that this attachment belongs to
        if ($attachment->contribution_id) {
            return $attachment->contribution->user_id === Auth::id();
        }

        // If attachment doesn't have a contribution yet, allow deletion (for newly uploaded files)
        return true;
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
        throw new HttpResponseException(
            response()->json([
                'message' => 'You are not authorized to delete this attachment',
            ], 403)
        );
    }
}

