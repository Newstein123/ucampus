<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CollaborationServiceInterface;
use App\Http\Requests\Api\CollaborationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CollaborationController extends Controller
{
    public function __construct(
        private CollaborationServiceInterface $collaborationService
    ) {}

    /**
     * Send request for project contribution
     */
    public function request(CollaborationRequest $request): JsonResponse
    {
        try {
            $result = $this->collaborationService->sendRequest(
                $request->contribution_id,
                $request->user()->id,
                $request->reason
            );

            return response()->json([
                'message' => 'Request sent successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Project leader response on project collaboration request
     */
    public function action(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:0,1,2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->collaborationService->handleAction($request->status);

            return response()->json([
                'message' => 'Success',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get project collaboration list
     */
    public function list(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:0,1,2',
            'user_id' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $collaborations = $this->collaborationService->getList(
                $request->get('status'),
                $request->get('user_id')
            );

            return response()->json([
                'message' => 'Success',
                'data' => [
                    'collaborations' => $collaborations
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
