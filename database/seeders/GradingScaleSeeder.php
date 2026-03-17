<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\GradeRange;
use App\Models\GradingScale;
use App\Models\School;
use Illuminate\Database\Seeder;

final class GradingScaleSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();

        $grades = [
            ['grade_letter' => 'A', 'min_mark' => 80, 'max_mark' => 100, 'descriptor' => 'Excellent',      'points' => 4.0],
            ['grade_letter' => 'B', 'min_mark' => 60, 'max_mark' => 79,  'descriptor' => 'Good',           'points' => 3.0],
            ['grade_letter' => 'C', 'min_mark' => 50, 'max_mark' => 59,  'descriptor' => 'Average',        'points' => 2.0],
            ['grade_letter' => 'D', 'min_mark' => 40, 'max_mark' => 49,  'descriptor' => 'Below Average',  'points' => 1.0],
            ['grade_letter' => 'E', 'min_mark' => 30, 'max_mark' => 39,  'descriptor' => 'Poor',           'points' => 0.5],
            ['grade_letter' => 'F', 'min_mark' => 0,  'max_mark' => 29,  'descriptor' => 'Fail',           'points' => 0.0],
        ];

        foreach ($schools as $school) {
            $scale = GradingScale::query()->updateOrCreate(
                ['school_id' => $school->id, 'name' => 'Default'],
                ['school_id' => $school->id, 'name' => 'Default', 'is_default' => true],
            );

            foreach ($grades as $grade) {
                GradeRange::query()->updateOrCreate(
                    ['grading_scale_id' => $scale->id, 'grade_letter' => $grade['grade_letter']],
                    array_merge($grade, ['grading_scale_id' => $scale->id]),
                );
            }
        }
    }
}
