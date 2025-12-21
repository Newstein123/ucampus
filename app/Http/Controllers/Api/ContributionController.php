<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DeleteContributionRequest;
use App\Http\Requests\Api\UpdateContributionRequest;
use App\Http\Requests\ContributionController\CreateRequest;
use App\Http\Requests\ContributionController\InterestRequest;
use App\Http\Requests\ContributionController\ListRequest;
use App\Http\Requests\ContributionController\SearchRequest;
use App\Http\Requests\ContributionController\ShowRequest;
use App\Http\Requests\ContributionController\TrendingRequest;
use App\Http\Requests\ContributionController\UploadAttachmentRequest;
use App\Http\Resources\ContributionResource;
use App\Services\ContributionServiceInterface;
use Illuminate\Support\Facades\Auth;

class ContributionController extends Controller
{
    protected $contributionService;

    public function __construct(ContributionServiceInterface $contributionService)
    {
        $this->contributionService = $contributionService;
    }

    public function index(ListRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->list($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Contributions fetched successfully');
    }

    public function search(SearchRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->search($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Contributions searched successfully');
    }

    public function trending(TrendingRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->trending($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Trending contributions fetched successfully');
    }

    public function show(ShowRequest $request)
    {
        $data = $request->validated();
        $contribution = $this->contributionService->find($data['contribution_id']);
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution fetched successfully');
    }

    public function store(CreateRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $contribution = $this->contributionService->create($data);
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution created successfully');
    }

    public function interest(InterestRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $result = $this->contributionService->interested($data);

        return $this->response($result, $result['message']);
    }

    public function update(UpdateContributionRequest $request, int $id)
    {
        $data = $request->validated();
        $data['id'] = $id;
        $data['user_id'] = Auth::user()->id;
        $contribution = $this->contributionService->update($data);
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution updated successfully');
    }

    public function destroy(DeleteContributionRequest $request, int $id)
    {
        $this->contributionService->delete($id);

        return $this->response(null, 'Contribution deleted successfully');
    }

    /**
     * Upload a single attachment file
     * 
     * @param UploadAttachmentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadAttachment(UploadAttachmentRequest $request)
    {
        $file = $request->file('file');
        $result = $this->contributionService->uploadAttachment($file);
        return $this->response($result, 'Attachment uploaded successfully');
    }
}

