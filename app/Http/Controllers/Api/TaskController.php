<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaskServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function __construct(
        private TaskServiceInterface $taskService
    ) {}

    public function index(int $contributionId): JsonResponse
    {
        try {
            $tasks = $this->taskService->getTasks($contributionId);

            return response()->json([
                'message' => 'Tasks retrieved successfully',
                'data' => $tasks
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
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date|after:today',
            'status' => 'nullable|in:to-do,in-progress,completed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = $this->taskService->createTask($contributionId, $request->user()->id, $request->all());

            return response()->json([
                'message' => 'Task created successfully',
                'data' => $task
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function update(Request $request, int $contributionId, int $taskId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|required|in:to-do,in-progress,completed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = $this->taskService->updateTask($taskId, $request->user()->id, $request->all());

            return response()->json([
                'message' => 'Task updated successfully',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy(Request $request, int $contributionId, int $taskId): JsonResponse
    {
        try {
            $result = $this->taskService->deleteTask($taskId, $request->user()->id);

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