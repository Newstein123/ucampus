<?php

namespace Database\Seeders;

use App\Models\Contribution;
use Illuminate\Database\Seeder;

class ContributionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create two concrete project contributions
        Contribution::factory()->create([
            'title' => 'My First Project',
            'type' => 'project',
            'is_public' => true,
            'allow_collab' => true,
            'content' => json_encode([
                'description' => 'Project description...',
                'problem' => 'Describe the problem this project solves.',
                'solution' => 'Outline your solution approach.',
                'impact' => 'Who benefits and why.',
                'resources' => 'List any resources needed.',
            ]),
            'thumbnail_url' => 'images/assets/idea-sample.png',
            'status' => 'active',
        ]);

        Contribution::factory()->create([
            'title' => 'AI-powered Study Planner',
            'type' => 'project',
            'is_public' => true,
            'allow_collab' => true,
            'content' => json_encode([
                'description' => 'Smart planner to optimize study schedules.',
                'problem' => 'Students struggle to plan effectively.',
                'solution' => 'Use AI to generate and adjust plans.',
                'impact' => 'Improved outcomes and time management.',
                'resources' => 'Dataset, models, and UI.',
            ]),
            'thumbnail_url' => 'images/assets/idea-sample.png',
            'status' => 'active',
        ]);

        Contribution::factory(100)->create();
    }
}
