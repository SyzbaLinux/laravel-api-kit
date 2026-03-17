<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AssessmentCategory;
use App\Enums\ReportCardStatus;
use App\Models\Assessment;
use App\Models\AssessmentType;
use App\Models\GradingScale;
use App\Models\Mark;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Models\SubjectResult;
use App\Models\User;
use Illuminate\Support\Collection;

final class ResultCalculationService
{
    private readonly GradingScaleService $gradingScaleService;

    public function __construct()
    {
        $this->gradingScaleService = new GradingScaleService();
    }

    public function calculateForClass(int $classId, int $termId): void
    {
        $schoolId = (int) app('current_school_id');

        /** @var SchoolClass $class */
        $class = SchoolClass::query()
            ->withoutGlobalScope('tenant')
            ->with(['students', 'subjects'])
            ->findOrFail($classId);

        $students = $class->students;
        $subjects = $class->subjects;

        // Get all assessment types for the school
        $allTypes = AssessmentType::query()
            ->withoutGlobalScope('tenant')
            ->where('school_id', $schoolId)
            ->get();

        $caTypes   = $allTypes->filter(fn (AssessmentType $t) => $t->category === AssessmentCategory::CONTINUOUS_ASSESSMENT);
        $examTypes = $allTypes->filter(fn (AssessmentType $t) => $t->category === AssessmentCategory::EXAMINATION);

        $totalWeight   = $allTypes->sum('weight');
        $caWeight      = $caTypes->sum('weight');
        $caFraction    = $totalWeight > 0 ? $caWeight / $totalWeight : 0.5;
        $examFraction  = 1.0 - $caFraction;

        // Get the default grading scale for this school
        /** @var GradingScale|null $gradingScale */
        $gradingScale = GradingScale::query()
            ->withoutGlobalScope('tenant')
            ->with('gradeRanges')
            ->where('school_id', $schoolId)
            ->where('is_default', true)
            ->first();

        // Collect all assessments for this class/term
        $assessments = Assessment::query()
            ->withoutGlobalScope('tenant')
            ->where('school_class_id', $classId)
            ->where('academic_term_id', $termId)
            ->where('school_id', $schoolId)
            ->get();

        // Collect all marks for those assessments
        $assessmentIds = $assessments->pluck('id');
        $allMarks = Mark::query()
            ->withoutGlobalScope('tenant')
            ->whereIn('assessment_id', $assessmentIds)
            ->get()
            ->groupBy('assessment_id');

        $studentAverages = [];

        foreach ($students as $student) {
            $studentId     = $student->id;
            $subjectFinals = [];

            foreach ($subjects as $subject) {
                $subjectId = $subject->id;

                // Filter assessments for this subject
                $subjectAssessments = $assessments->where('subject_id', $subjectId);

                $caScores   = [];
                $examScores = [];

                foreach ($subjectAssessments as $assessment) {
                    $marksForAssessment = $allMarks->get($assessment->id, collect());
                    $mark = $marksForAssessment->firstWhere('student_id', $studentId);

                    if ($mark === null || $assessment->max_score <= 0) {
                        continue;
                    }

                    $pct = ($mark->score / $assessment->max_score) * 100.0;

                    // Determine if this is CA or exam type
                    $type = $allTypes->firstWhere('id', $assessment->assessment_type_id);
                    if ($type === null) {
                        continue;
                    }

                    if ($type->category === AssessmentCategory::CONTINUOUS_ASSESSMENT) {
                        $caScores[] = $pct;
                    } else {
                        $examScores[] = $pct;
                    }
                }

                $caScore   = count($caScores) > 0 ? array_sum($caScores) / count($caScores) : 0.0;
                $examScore = count($examScores) > 0 ? array_sum($examScores) / count($examScores) : 0.0;
                $finalMark = ($caFraction * $caScore) + ($examFraction * $examScore);

                // Resolve grade
                $gradeLetter = null;
                $points      = null;

                if ($gradingScale !== null) {
                    $gradeRange  = $this->gradingScaleService->resolveGrade($gradingScale, $finalMark);
                    $gradeLetter = $gradeRange?->grade_letter;
                    $points      = $gradeRange?->points;
                } else {
                    // Hardcoded fallback
                    $gradeLetter = $this->hardcodedGrade($finalMark);
                }

                // Upsert SubjectResult
                SubjectResult::query()
                    ->withoutGlobalScope('tenant')
                    ->updateOrCreate(
                        [
                            'student_id'       => $studentId,
                            'subject_id'       => $subjectId,
                            'academic_term_id' => $termId,
                        ],
                        [
                            'school_id'       => $schoolId,
                            'school_class_id' => $classId,
                            'ca_score'        => round($caScore, 2),
                            'exam_score'      => round($examScore, 2),
                            'final_mark'      => round($finalMark, 2),
                            'grade_letter'    => $gradeLetter,
                            'points'          => $points,
                        ],
                    );

                $subjectFinals[] = $finalMark;
            }

            $average = count($subjectFinals) > 0
                ? array_sum($subjectFinals) / count($subjectFinals)
                : 0.0;

            $studentAverages[$studentId] = $average;

            // Upsert ReportCard (draft)
            ReportCard::query()
                ->withoutGlobalScope('tenant')
                ->updateOrCreate(
                    [
                        'student_id'       => $studentId,
                        'academic_term_id' => $termId,
                    ],
                    [
                        'school_id'       => $schoolId,
                        'school_class_id' => $classId,
                        'status'          => ReportCardStatus::DRAFT->value,
                        'total_marks'     => round(array_sum($subjectFinals), 2),
                        'average'         => round($average, 2),
                    ],
                );
        }

        // Calculate and update positions
        arsort($studentAverages);
        $position = 1;

        foreach ($studentAverages as $studentId => $average) {
            ReportCard::query()
                ->withoutGlobalScope('tenant')
                ->where('student_id', $studentId)
                ->where('academic_term_id', $termId)
                ->update(['position' => $position]);

            $position++;
        }
    }

    private function hardcodedGrade(float $mark): string
    {
        return match (true) {
            $mark >= 80 => 'A',
            $mark >= 60 => 'B',
            $mark >= 50 => 'C',
            $mark >= 40 => 'D',
            default     => 'F',
        };
    }
}
