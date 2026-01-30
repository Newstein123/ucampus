<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditRequestController\ApproveEditRequest;
use App\Http\Requests\EditRequestController\CreateEditRequest;
use App\Http\Requests\EditRequestController\RejectEditRequest;
use App\Http\Resources\EditRequestResource;
use App\Services\EditRequestServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EditRequestController extends Controller
{
    protected $editRequestService;

    public function __construct(EditRequestServiceInterface $editRequestService)
    {
        $this->editRequestService = $editRequestService;
    }

    /**
     * Create edit request for a contribution
     * POST /api/contributions/{id}/edit-requests
     */
    public function store(CreateEditRequest $request, $id)
    {
        $data = $request->validated();
        $userId = Auth::id();

        $editRequest = $this->editRequestService->create(
            $id,
            $userId,
            $data['changes'],
            $data['note'] ?? null
        );

        return $this->response(new EditRequestResource($editRequest), 'Edit request created successfully');
    }

    /**
     * Retrieve all edit requests for a contribution
     * GET /api/contributions/{id}/edit-requests
     */
    public function index(Request $request, $id)
    {
        $status = $request->query('status');
        $contentKey = $request->query('content_key');
        $editRequests = $this->editRequestService->list($id, $status, $contentKey);

        return $this->response([
            'edit_requests' => EditRequestResource::collection($editRequests)
        ], 'Edit requests retrieved successfully');
    }

    /**
     * Approve edit request and apply changes
     * POST /api/edit-requests/{id}/approve
     */
    public function approve(ApproveEditRequest $request, $id)
    {
        $reviewerId = Auth::id();
        $result = $this->editRequestService->approve($id, $reviewerId);

        return $this->response(new EditRequestResource($result), 'Edit request approved successfully');
    }

    /**
     * Reject edit request
     * POST /api/edit-requests/{id}/reject
     */
    public function reject(RejectEditRequest $request, $id)
    {
        $data = $request->validated();
        $reviewerId = Auth::id();
        $result = $this->editRequestService->reject($id, $reviewerId, $data['note'] ?? null);

        return $this->response(new EditRequestResource($result), 'Edit request rejected successfully');
    }

    /**
     * Retrieve edit requests created by authenticated user
     * GET /api/my/edit-requests
     */
    public function myRequests(Request $request)
    {
        $status = $request->query('status');
        $userId = Auth::id();
        $editRequests = $this->editRequestService->getUserEditRequests($userId, $status);

        return $this->response([
            'edit_requests' => EditRequestResource::collection($editRequests)
        ], 'User edit requests retrieved successfully');
    }
}
