<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicTerm>
 */
final class AcademicTermFactory extends Factory
{
    protected $model = AcademicTerm::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $termNumber = fake()->numberBetween(1, 3);

        return [
            'name' => 'Term '.$termNumber,
            'academic_year_id' => AcademicYear::factory(),
            'start_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'end_date' => fake()->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
            'is_current' => false,
        ];
    }

    public function current(): static
    {
        return $this->state(fn (array $attributes): array => ['is_current' => true]);
    }
}
