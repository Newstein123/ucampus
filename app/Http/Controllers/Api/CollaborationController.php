<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CollaborationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CollaborationController extends Controller
{
    public function __construct(
        private CollaborationServiceInterface $collaborationService
    ) {}

    public function requestCollaboration(Request $request, int $contributionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:10|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->collaborationService->requestCollaboration(
                $contributionId,
                $request->user()->id,
                $request->message
            );

            return response()->json([
                'message' => 'Collaboration request sent successfully',
                'data' => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getCollaborators(int $contributionId): JsonResponse
    {
        try {
            $collaborators = $this->collaborationService->getCollaborators($contributionId);
            $allRequests = $this->collaborationService->getAllCollaborationRequests($contributionId);

            return response()->json([
                'message' => 'Collaborators retrieved successfully',
                'data' => $collaborators,
                'debug' => [
                    'all_requests' => $allRequests,
                    'contribution_id' => $contributionId
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function approveCollaboration(Request $request, int $contributionId, int $userId): JsonResponse
    {
        try {
            if (!$this->collaborationService->canUserManageCollaboration($contributionId, $request->user()->id)) {
                return response()->json([
                    'message' => 'Unauthorized to manage collaboration'
                ], 403);
            }

            $result = $this->collaborationService->approveCollaboration($contributionId, $userId);

            return response()->json([
                'message' => $result['message']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function rejectCollaboration(Request $request, int $contributionId, int $userId): JsonResponse
    {
        try {
            if (!$this->collaborationService->canUserManageCollaboration($contributionId, $request->user()->id)) {
                return response()->json([
                    'message' => 'Unauthorized to manage collaboration'
                ], 403);
            }

            $result = $this->collaborationService->rejectCollaboration($contributionId, $userId);

            return response()->json([
                'message' => $result['message']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
} 