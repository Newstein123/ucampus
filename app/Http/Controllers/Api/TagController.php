<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TagServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(
        protected TagServiceInterface $tagService
    ) {}

    public function trending(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 10);
        $tags = $this->tagService->getTrending((int) $limit);

        return $this->response(
            $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'contributions_count' => $tag->contributions_count ?? 0,
                ];
            }),
            'Trending tags retrieved successfully'
        );
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $limit = $request->query('limit', 20);

        if (empty($query)) {
            return $this->response([], 'Please provide a search query', 400);
        }

        $tags = $this->tagService->search($query, (int) $limit);

        return $this->response(
            $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'contributions_count' => $tag->contributions_count ?? 0,
                ];
            }),
            'Tags retrieved successfully'
        );
    }
}

