<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubscriptionPlan>
 */
final class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word().' Plan';

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'max_students' => fake()->numberBetween(100, 2000),
            'max_teachers' => fake()->numberBetween(10, 200),
            'max_storage_gb' => fake()->numberBetween(5, 100),
            'features' => ['basic_attendance', 'report_cards'],
            'price_monthly' => fake()->randomFloat(2, 10, 500),
            'price_yearly' => fake()->randomFloat(2, 100, 5000),
            'is_active' => true,
        ];
    }
}
