<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AssessmentCategory;
use App\Models\Assessment;
use App\Models\Mark;

final class ContinuousAssessmentService
{
    /**
     * Calculate the CA score (as percentage) for a student/subject/class/term combination.
     */
    public function calculateCA(int $studentId, int $subjectId, int $classId, int $termId): float
    {
        $assessments = Assessment::query()
            ->whereHas('assessmentType', fn ($q) => $q->where('category', AssessmentCategory::CONTINUOUS_ASSESSMENT->value))
            ->where('subject_id', $subjectId)
            ->where('school_class_id', $classId)
            ->where('academic_term_id', $termId)
            ->get();

        if ($assessments->isEmpty()) {
            return 0.0;
        }

        $scores = [];

        foreach ($assessments as $assessment) {
            /** @var Mark|null $mark */
            $mark = Mark::query()
                ->where('assessment_id', $assessment->id)
                ->where('student_id', $studentId)
                ->first();

            if ($mark !== null && $assessment->max_score > 0) {
                $scores[] = ($mark->score / $assessment->max_score) * 100;
            }
        }

        if (empty($scores)) {
            return 0.0;
        }

        return array_sum($scores) / count($scores);
    }
}
