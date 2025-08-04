<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProgressServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProgressController extends Controller
{
    public function __construct(
        private ProgressServiceInterface $progressService
    ) {}

    public function index(int $contributionId): JsonResponse
    {
        try {
            $updates = $this->progressService->getProgressUpdates($contributionId);

            return response()->json([
                'message' => 'Progress updates retrieved successfully',
                'data' => $updates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function store(Request $request, int $contributionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:10|max:2000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $update = $this->progressService->createProgressUpdate(
                $contributionId,
                $request->user()->id,
                $request->content
            );

            return response()->json([
                'message' => 'Progress update created successfully',
                'data' => $update
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
} 