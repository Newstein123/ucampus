<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContributionController\BookmarkListRequest;
use App\Http\Requests\ContributionController\BookmarkRequest;
use App\Http\Resources\ContributionResource;
use App\Services\ContributionServiceInterface;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    public function __construct(private ContributionServiceInterface $contributionService) {}

    public function store(int $id, BookmarkRequest $request)
    {
        $data = $request->validated();
        $userId = Auth::user()->id;
        $result = $this->contributionService->toggleBookmark($userId, $data['contribution_id']);
        return $this->response($result, $result['message']);
    }

    public function destroy(int $id, BookmarkRequest $request)
    {
        $data = $request->validated();
        $userId = Auth::user()->id;
        $this->contributionService->unbookmark($userId, $data['contribution_id']);

        return $this->response(null, 'Contribution Bookmark Removed Successfully');
    }

    public function index(BookmarkListRequest $request)
    {
        $data = $request->validated();
        $userId = Auth::user()->id;
        $list = $this->contributionService->listBookmarks($userId, $data['type'] ?? null, $data['per_page'], $data['page']);
        $resource = ContributionResource::collection($list);

        return $this->response($resource, "User's bookmarks retrieved successfully.");
    }
}
