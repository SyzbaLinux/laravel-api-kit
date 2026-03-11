<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Department;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
final class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Mathematics', 'Science', 'English', 'History', 'Geography',
                'Physical Education', 'Arts', 'Music', 'Computer Science', 'Languages',
            ]).' Department',
            'description' => fake()->optional()->sentence(),
            'school_id' => School::factory(),
            'hod_id' => null,
        ];
    }
}
