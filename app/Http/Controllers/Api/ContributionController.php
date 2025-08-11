<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContributionController\ListRequest;
use App\Http\Requests\ContributionController\CreateRequest;
use App\Http\Requests\ContributionController\InterestRequest;
use App\Http\Requests\ContributionController\ShowRequest;
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
}
