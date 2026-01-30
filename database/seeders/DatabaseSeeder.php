<?php

namespace Database\Seeders;

use App\Models\Contribution;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tags = [
            'agriculture',
            'education',
            'health',
            'technology',
            'environment',
            'social',
            'economy',
            'politics',
            'culture',
            'other',
        ];

        foreach ($tags as $tag) {
            Tag::create([
                'name' => $tag,
            ]);
        }

        $this->call([
            UserSeeder::class,
            // ContributionSeeder::class,
            // ContributionRoleSeeder::class,
            // DiscussionSeeder::class,
        ]);

        // connect tags to contributions
        // $contributions = Contribution::all();
        // foreach ($contributions as $contribution) {
        //     $contribution->tags()->attach(Tag::inRandomOrder()->first()->id);
        // }
    }
}
