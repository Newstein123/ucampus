<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiscussionController\AllResponseRequest;
use App\Http\Requests\DiscussionController\CreateRequest;
use App\Http\Requests\DiscussionController\DeleteRequest;
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
        $discussions = $this->discussionService->getAllParentDiscussions($id);
        $resource = DiscussionResource::collection($discussions);
        return $this->response($resource, 'Discussions fetched successfully');
    }

    public function getAllResponses(AllResponseRequest $request)
    {
        $id = $request->validated()['discussion_id'];
        $responses = $this->discussionService->getAllResponses($id);
        $resource = new DiscussionResource($responses);
        return $this->response($resource, 'Responses fetched successfully');
    }

    public function store(CreateRequest $request)
    {
        $data = $request->validated();
        $discussion = $this->discussionService->create($data);
        $resource = new DiscussionResource($discussion);
        return $this->response($resource, 'discussion created successfully');
    }

    public function update(UpdateRequest $request)
    {
        $data = $request->validated();
        $discussion = $this->discussionService->update($data['discussion_id'], $data);
        $resource = new DiscussionResource($discussion);
        return $this->response($resource, 'discussion updated successfully');
    }

    public function delete(DeleteRequest $request)
    {
        $data = $request->validated();
        $this->discussionService->delete($data['discussion_id']);
        return $this->response(null, 'discussion deleted successfully');
    }
}
