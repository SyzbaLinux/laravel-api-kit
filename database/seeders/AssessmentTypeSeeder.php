<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AssessmentCategory;
use App\Models\AssessmentType;
use App\Models\School;
use Illuminate\Database\Seeder;

final class AssessmentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();

        $types = [
            ['name' => 'Monthly Test',  'category' => AssessmentCategory::CONTINUOUS_ASSESSMENT, 'weight' => 20],
            ['name' => 'Exercise',      'category' => AssessmentCategory::CONTINUOUS_ASSESSMENT, 'weight' => 10],
            ['name' => 'Mid-Term Exam', 'category' => AssessmentCategory::EXAMINATION,           'weight' => 30],
            ['name' => 'Final Exam',    'category' => AssessmentCategory::EXAMINATION,           'weight' => 40],
        ];

        foreach ($schools as $school) {
            foreach ($types as $type) {
                AssessmentType::query()->updateOrCreate(
                    ['school_id' => $school->id, 'name' => $type['name']],
                    [
                        'school_id' => $school->id,
                        'name'      => $type['name'],
                        'category'  => $type['category']->value,
                        'weight'    => $type['weight'],
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
