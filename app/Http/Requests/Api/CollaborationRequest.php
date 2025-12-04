<?php

namespace App\Http\Requests\Api;

use App\Repositories\CollaborationRepositoryInterface;
use App\Repositories\ContributionRepositoryInterface;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CollaborationRequest extends FormRequest
{
    public function __construct(
        private CollaborationRepositoryInterface $collaborationRepository,
        private ContributionRepositoryInterface $contributionRepository
    ) {
        parent::__construct();
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'contribution_id' => 'required|exists:contributions,id',
            'reason' => 'required|string|min:10|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'contribution_id.required' => 'Contribution ID is required.',
            'contribution_id.exists' => 'The specified contribution does not exist.',
            'reason.required' => 'Reason is required.',
            'reason.string' => 'Reason must be a string.',
            'reason.min' => 'Reason must be at least 10 characters.',
            'reason.max' => 'Reason cannot exceed 500 characters.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $contributionId = $this->input('contribution_id');
            $userId = $this->user()->id;

            // Verify the contribution exists and allows collaboration
            $contribution = $this->contributionRepository->findById($contributionId);
            if (! $contribution || ! $contribution['allow_collab']) {
                $validator->errors()->add('contribution_id', 'Contribution does not allow collaboration');

                return;
            }

            // Verify user is not the owner
            if ($this->collaborationRepository->checkIfUserIsOwner($contributionId, $userId)) {
                $validator->errors()->add('contribution_id', 'Project owner cannot request collaboration');
            }

            // Verify user is not already a collaborator
            if ($this->collaborationRepository->checkIfUserIsCollaborator($contributionId, $userId)) {
                $validator->errors()->add('contribution_id', 'User is already a collaborator');
            }
        });
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
