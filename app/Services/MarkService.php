<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Assessment;
use App\Models\Mark;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Support\Collection;

final class MarkService
{
    /**
     * Return all marks for an assessment, with null placeholders for students without marks.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMarks(Assessment $assessment): array
    {
        /** @var SchoolClass $schoolClass */
        $schoolClass = $assessment->schoolClass()->withoutGlobalScope('tenant')->find($assessment->school_class_id);

        $students = $schoolClass
            ? $schoolClass->students()->get()
            : collect();

        $marks = Mark::query()
            ->where('assessment_id', $assessment->id)
            ->get()
            ->keyBy('student_id');

        return $students->map(function (User $student) use ($marks, $assessment): array {
            /** @var Mark|null $mark */
            $mark = $marks->get($student->id);

            return [
                'student_id'   => $student->id,
                'student_name' => $student->name,
                'mark_id'      => $mark?->id,
                'score'        => $mark?->score,
                'comment'      => $mark?->comment,
            ];
        })->values()->all();
    }

    /**
     * Bulk upsert marks for an assessment.
     *
     * @param  array<int, array<string, mixed>>  $marksData
     * @return Collection<int, Mark>
     */
    public function bulkSave(Assessment $assessment, array $marksData): Collection
    {
        $schoolId = app('current_school_id');
        $results  = collect();

        foreach ($marksData as $item) {
            $mark = Mark::query()->updateOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'student_id'    => (int) $item['student_id'],
                ],
                [
                    'school_id'  => $schoolId,
                    'score'      => (float) $item['score'],
                    'comment'    => $item['comment'] ?? null,
                ],
            );

            $results->push($mark);
        }

        return $results;
    }

    public function saveMark(Assessment $assessment, int $studentId, float $score, ?string $comment = null): Mark
    {
        return Mark::query()->updateOrCreate(
            [
                'assessment_id' => $assessment->id,
                'student_id'    => $studentId,
            ],
            [
                'school_id' => app('current_school_id'),
                'score'     => $score,
                'comment'   => $comment,
            ],
        );
    }
}
