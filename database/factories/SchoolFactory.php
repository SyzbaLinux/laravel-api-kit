<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\EducationLevel;
use App\Enums\SchoolStatus;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<School>
 */
final class SchoolFactory extends Factory
{
    protected $model = School::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company().' School';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'country' => 'Zimbabwe',
            'education_level' => fake()->randomElement(EducationLevel::cases()),
            'status' => SchoolStatus::ACTIVE,
            'max_students' => 500,
            'max_teachers' => 50,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SchoolStatus::INACTIVE,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SchoolStatus::SUSPENDED,
        ]);
    }
}
