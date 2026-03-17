<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ReportCardStatus;
use App\Models\AcademicTerm;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Models\SubjectResult;
use App\Models\User;

final class ReportCardService
{
    /**
     * @return array<string, mixed>
     */
    public function getReportCardData(int $studentId, int $termId): array
    {
        /** @var ReportCard $reportCard */
        $reportCard = ReportCard::query()
            ->with(['student', 'schoolClass', 'academicTerm.academicYear'])
            ->where('student_id', $studentId)
            ->where('academic_term_id', $termId)
            ->firstOrFail();

        /** @var User $student */
        $student = $reportCard->student;

        /** @var SchoolClass $schoolClass */
        $schoolClass = $reportCard->schoolClass;

        /** @var AcademicTerm $term */
        $term = $reportCard->academicTerm;

        $subjectResults = SubjectResult::query()
            ->with('subject')
            ->where('student_id', $studentId)
            ->where('academic_term_id', $termId)
            ->get();

        // Class size
        $classSize = ReportCard::query()
            ->where('school_class_id', $reportCard->school_class_id)
            ->where('academic_term_id', $termId)
            ->count();

        // Class teacher
        $classTeacher = $schoolClass->classTeacher()->first();

        return [
            'report_card' => $reportCard,
            'student'     => [
                'id'             => $student->id,
                'name'           => $student->name,
                'student_number' => $student->studentProfile?->student_number,
            ],
            'class' => [
                'id'          => $schoolClass->id,
                'name'        => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
            ],
            'term' => [
                'id'   => $term->id,
                'name' => $term->name,
            ],
            'academic_year' => [
                'id'   => $term->academicYear?->id,
                'name' => $term->academicYear?->name,
            ],
            'subject_results' => $subjectResults->map(fn (SubjectResult $r) => array_merge($r->toArray(), [
                'subject_name' => $r->subject?->name ?? '',
                'subject_code' => $r->subject?->code ?? '',
            ]))->values()->all(),
            'class_teacher'         => $classTeacher,
            'class_teacher_comment' => $reportCard->class_teacher_comment,
            'class_size'            => $classSize,
            'attendance'            => [
                'total_days' => null,
                'present'    => null,
                'absent'     => null,
            ],
        ];
    }

    /**
     * @return array<int, mixed>
     */
    public function getClassReportCards(int $classId, int $termId): array
    {
        return ReportCard::query()
            ->with('student')
            ->where('school_class_id', $classId)
            ->where('academic_term_id', $termId)
            ->orderBy('position')
            ->get()
            ->all();
    }

    public function approve(ReportCard $card, int $teacherId): ReportCard
    {
        $card->update([
            'status'      => ReportCardStatus::APPROVED->value,
            'approved_at' => now(),
        ]);

        return $card->refresh();
    }

    public function publish(ReportCard $card): ReportCard
    {
        $card->update([
            'status'       => ReportCardStatus::PUBLISHED->value,
            'published_at' => now(),
        ]);

        return $card->refresh();
    }

    public function unpublish(ReportCard $card): ReportCard
    {
        $card->update([
            'status'       => ReportCardStatus::APPROVED->value,
            'published_at' => null,
        ]);

        return $card->refresh();
    }

    public function updateClassTeacherComment(ReportCard $card, string $comment, ?string $promotionStatus): ReportCard
    {
        $card->update([
            'class_teacher_comment' => $comment,
            'promotion_status'      => $promotionStatus,
        ]);

        return $card->refresh();
    }

    public function updateSubjectComment(SubjectResult $result, string $comment, int $teacherId): SubjectResult
    {
        $result->update([
            'teacher_comment' => $comment,
            'teacher_id'      => $teacherId,
        ]);

        return $result->refresh();
    }
}
