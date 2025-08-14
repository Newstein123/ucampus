<?php

namespace Database\Factories;

use App\Models\Discussion;
use App\Models\User;
use App\Models\Contribution;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Discussion>
 */
class DiscussionFactory extends Factory
{
    protected $model = Discussion::class;

    public function definition(): array
    {
        return [
            'contribution_id' => Contribution::inRandomOrder()->first()->id ?? Contribution::factory(),
            'user_id'         => User::inRandomOrder()->first()->id ?? User::factory(),
            'parent_id'       => null,
            'is_edited'       => $this->faker->boolean(20),
            'content'         => $this->faker->paragraph(),
            'upvotes'         => $this->faker->numberBetween(0, 20),
            'downvotes'       => $this->faker->numberBetween(0, 5),
        ];
    }
}
