<?php

namespace App\Repositories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

class TagRepository implements TagRepositoryInterface
{
    public function createMany(array $data = [])
    {
        $ids = [];
        foreach ($data as $tag) {
            $ids[] = Tag::create(['name' => $tag])->id;
        }

        return $ids;
    }

    public function getTrending(int $limit = 10): Collection
    {
        return Tag::withCount('contributions')
            ->orderBy('contributions_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public function search(string $query, int $limit = 20): Collection
    {
        return Tag::where('name', 'like', "%{$query}%")
            ->withCount('contributions')
            ->orderBy('contributions_count', 'desc')
            ->limit($limit)
            ->get();
    }
}
