<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\DayOfWeek;
use App\Models\AcademicTerm;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Timetable>
 */
final class TimetableFactory extends Factory
{
    protected $model = Timetable::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->numberBetween(7, 14);
        $startTime = sprintf('%02d:00', $startHour);
        $endTime = sprintf('%02d:00', $startHour + 1);

        return [
            'school_class_id' => SchoolClass::factory(),
            'subject_id' => Subject::factory(),
            'teacher_id' => User::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'day_of_week' => fake()->randomElement(DayOfWeek::cases())->value,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }
}
