<?php

namespace Database\Seeders;

use App\Models\Discussion;
use Illuminate\Database\Seeder;

class DiscussionSeeder extends Seeder
{
    public function run(): void
    {
        $parents = Discussion::factory()
            ->count(5)
            ->create();

        $parents->each(function ($parent) {
            $children = Discussion::factory()
                ->count(rand(1, 3))
                ->create([
                    'contribution_id' => $parent->contribution_id,
                    'parent_id' => $parent->id,
                ]);

            $children->each(function ($child) {
                if (rand(0, 1)) {
                    Discussion::factory()
                        ->create([
                            'contribution_id' => $child->contribution_id,
                            'parent_id' => $child->id,
                        ]);
                }
            });
        });
    }
}
