<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SchoolClass>
 */
final class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grade = fake()->numberBetween(1, 7);
        $stream = fake()->optional(0.5)->randomElement(['A', 'B', 'C']);

        return [
            'name' => 'Grade '.$grade.($stream ? ' '.$stream : ''),
            'grade_level' => 'Grade '.$grade,
            'stream' => $stream,
            'capacity' => fake()->numberBetween(20, 45),
            'class_teacher_id' => null,
            'school_id' => School::factory(),
            'academic_year_id' => null,
        ];
    }
}
