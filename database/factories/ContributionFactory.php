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
                    'image' => 'images/assets/idea-sample.png',
                    'description' => fake()->paragraph(),
                    'problem' => fake()->paragraph(),
                    'solution' => fake()->paragraph(),
                    'impact' => fake()->paragraph(),
                    'resources' => fake()->paragraph(),
                    'references' => fake()->paragraph(),
                ]);
                break;
            case 'question':
                $content = json_encode([
                    'question' => fake()->sentence(),
                    'answer' => fake()->paragraph(),
                ]);
                break;
            default:
                $content = json_encode([
                    'body' => fake()->paragraph(),
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
