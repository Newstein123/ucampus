<?php

namespace Database\Seeders;

use App\Models\Contribution;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContributionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Contribution::factory()->count(100)->create();
    }
}
