<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiscussionController\AllResponseRequest;
use App\Http\Requests\DiscussionController\CreateRequest;
use App\Http\Requests\DiscussionController\DeleteRequest;
use App\Http\Requests\DiscussionController\InterestUpdateRequest;
use App\Http\Requests\DiscussionController\ParentDiscussionRequest;
use App\Http\Requests\DiscussionController\UpdateRequest;
use App\Http\Resources\DiscussionResource;
use App\Services\DiscussionServiceInterface;

class DiscussionController extends Controller
{
    protected $discussionService;

    public function __construct(DiscussionServiceInterface $discussionService)
    {
        $this->discussionService = $discussionService;
    }

    public function getAllParentDiscussions(ParentDiscussionRequest $request)
    {
        $id = $request->validated()['contribution_id'];
        unset($request['contribution_id']);
        $data = $request->validated();
        $discussions = $this->discussionService->getAllParentDiscussions($id, $data);
        $resource['discussions'] = DiscussionResource::collection($discussions);
        $resource['contribution_id'] = $id;
        $resource['pagination'] = [
            'total' => $discussions->total(),
            'per_page' => $discussions->perPage(),
            'current_page' => $discussions->currentPage(),
            'last_page' => $discussions->lastPage(),
        ];

        return $this->response($resource, "Retrieved contributions' discussions successfully");
    }

    public function getAllResponses(AllResponseRequest $request)
    {
        $id = $request->validated()['discussion_id'];
        $responses = $this->discussionService->getAllResponses($id);
        $resource['responses'] = new DiscussionResource($responses);

        return $this->response($resource, "Retrieved discussions' responses successfully");
    }

    public function store(CreateRequest $request)
    {
        $data = $request->validated();
        // Ensure user_id is set from the authenticated user
        $data['user_id'] = auth()->id();
        $discussion = $this->discussionService->create($data);
        $resource['discussions'] = new DiscussionResource($discussion);

        return $this->response($resource, 'Discussion created successfully');
    }

    public function update(UpdateRequest $request)
    {
        $data = $request->validated();
        $discussion = $this->discussionService->update($data['discussion_id'], $data);
        $resource['discussion'] = new DiscussionResource($discussion);

        return $this->response($resource, 'discussion updated successfully');
    }

    public function delete(DeleteRequest $request)
    {
        $data = $request->validated();
        $this->discussionService->delete($data['discussion_id']);

        return $this->response(null, 'discussion deleted successfully');
    }

    public function updateInterest(InterestUpdateRequest $request)
    {
        $data = $request->validated();
        $userId = auth()->id();
        $result = $this->discussionService->updateInterest($data['discussion_id'], $userId);

        return $this->response([
            'is_interested' => $result['is_interested'],
            'interests' => $result['interests'],
        ], $result['message']);
    }
}
