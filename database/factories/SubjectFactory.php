<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\SubjectLevel;
use App\Models\School;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subject>
 */
final class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics',
            'History', 'Geography', 'Computer Science', 'Art', 'Music',
            'Physical Education', 'Religious Studies', 'Shona', 'Ndebele',
        ]);

        return [
            'name' => $name,
            'code' => strtoupper(substr($name, 0, 3)).fake()->unique()->numberBetween(100, 999),
            'description' => fake()->optional()->sentence(),
            'department_id' => null,
            'school_id' => School::factory(),
            'education_level' => fake()->randomElement(SubjectLevel::cases())->value,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }
}
