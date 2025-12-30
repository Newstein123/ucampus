<?php

namespace Database\Seeders;

use App\Models\ContributionRole;
use Illuminate\Database\Seeder;

class ContributionRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ContributionRole::create([
            'key' => 'developer',
            'label' => 'Developer',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'designer',
            'label' => 'Designer',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'marketer',
            'label' => 'Marketer',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'writer',
            'label' => 'Writer',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'translator',
            'label' => 'Translator',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'editor',
            'label' => 'Editor',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'proofreader',
            'label' => 'Proofreader',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'researcher',
            'label' => 'Researcher',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'reviewer',
            'label' => 'Reviewer',
            'is_active' => true,
        ]);
        ContributionRole::create([
            'key' => 'other',
            'label' => 'Other',
            'is_active' => true,
        ]);
    }
}
