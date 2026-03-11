<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicYear>
 */
final class AcademicYearFactory extends Factory
{
    protected $model = AcademicYear::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = fake()->numberBetween(2024, 2030);

        return [
            'name' => (string) $year,
            'start_date' => $year.'-01-01',
            'end_date' => $year.'-12-31',
            'is_current' => false,
            'school_id' => School::factory(),
        ];
    }

    public function current(): static
    {
        return $this->state(fn (array $attributes): array => ['is_current' => true]);
    }
}
