<?php

namespace Database\Factories;

use App\Models\Discussion;
use App\Models\Contribution;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'recipient_user_id' => User::inRandomOrder()->first()->id,
            'sender_user_id' => User::inRandomOrder()->first()->id,
            'type' => $this->faker->randomElement(['new_discussion', 'collab_request', 'project_update', 'contribution_liked']),
            'source_id' => $this->faker->randomElement([1, 2, 3]),
            'source_type' => $this->faker->randomElement([Contribution::class]),
            'message' => $this->faker->sentence(),
            'is_read' => $this->faker->boolean(),
            'redirect_url' => $this->faker->url(),
        ];
    }
}
