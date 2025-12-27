<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class ContributionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['idea', 'question']);

        switch ($type) {
            case 'idea':
                $content = json_encode([
                    'problem' => fake()->paragraph(),
                    'thought' => fake()->paragraph(),
                    'why_it_matters' => fake()->paragraph(),
                ]);
                break;
            case 'question':
                $content = json_encode([
                    'thought' => fake()->paragraph(),
                ]);
                break;
            case 'project':
                $content = json_encode([
                    'description' => fake()->paragraph(),
                    'problem' => fake()->paragraph(),
                    'solution' => fake()->paragraph(),
                    'impact' => fake()->paragraph(),
                    'resources' => fake()->paragraph(),
                    'references' => fake()->paragraph(),
                ]);
                break;
        }

        return [
            'title' => fake()->sentence(),
            'content' => $content,
            'user_id' => User::inRandomOrder()->first()->id,
            'type' => $type,
            'allow_collab' => fake()->boolean(),
            'is_public' => fake()->boolean(),
            'status' => fake()->randomElement(['draft', 'active', 'completed']),
            'views_count' => fake()->numberBetween(0, 1000),
            'thumbnail_url' => 'images/assets/idea-sample.png',
            'likes_count' => fake()->numberBetween(0, 1000),
            'created_at' => fake()->dateTime(),
            'updated_at' => fake()->dateTime(),
        ];
    }
}
