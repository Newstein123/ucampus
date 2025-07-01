<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContributionController\ListRequest;
use App\Http\Resources\ContributionResource;
use App\Services\ContributionServiceInterface;

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
}
