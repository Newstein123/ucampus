<?php

namespace App\Repositories;

use App\Models\Tag;

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
}
