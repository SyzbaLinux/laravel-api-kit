<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Timetable;
use App\Models\User;
use Carbon\Carbon;

final class TeacherDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function getStats(User $teacher): array
    {
        $schoolId = $teacher->school_id;
        $todayDow = Carbon::today()->dayOfWeekIso; // 1=Mon ... 7=Sun

        $currentYear = AcademicYear::query()
            ->where('school_id', $schoolId)
            ->where('is_current', true)
            ->first();

        $currentTerm = AcademicTerm::query()
            ->where('is_current', true)
            ->whereHas('academicYear', fn ($q) => $q->where('school_id', $schoolId))
            ->first();

        // Classes I teach (via class_subject pivot)
        $myClasses = SchoolClass::query()
            ->where('school_id', $schoolId)
            ->whereHas('subjects', fn ($q) => $q->where('class_subject.teacher_id', $teacher->id))
            ->with([
                'subjects' => fn ($q) => $q->where('class_subject.teacher_id', $teacher->id),
            ])
            ->withCount('students')
            ->get();

        $subjectsCount = $myClasses->flatMap->subjects->unique('id')->count();
        $studentsTotal = $myClasses->sum('students_count');

        // Today's timetable entries for this teacher
        $todaySchedule = Timetable::query()
            ->where('teacher_id', $teacher->id)
            ->where('day_of_week', $todayDow)
            ->when($currentTerm, fn ($q) => $q->where('academic_term_id', $currentTerm->id))
            ->with(['schoolClass', 'subject'])
            ->orderBy('start_time')
            ->get();

        return [
            'classes_count' => $myClasses->count(),
            'subjects_count' => $subjectsCount,
            'today_periods' => $todaySchedule->count(),
            'students_count' => $studentsTotal,
            'current_year' => $currentYear ? [
                'id' => $currentYear->id,
                'name' => $currentYear->name,
                'start_date' => $currentYear->start_date,
                'end_date' => $currentYear->end_date,
            ] : null,
            'current_term' => $currentTerm ? [
                'id' => $currentTerm->id,
                'name' => $currentTerm->name,
                'start_date' => $currentTerm->start_date,
                'end_date' => $currentTerm->end_date,
            ] : null,
            'today_schedule' => $todaySchedule->map(fn ($t) => [
                'id' => $t->id,
                'start_time' => $t->start_time,
                'end_time' => $t->end_time,
                'subject' => $t->subject ? [
                    'id' => $t->subject->id,
                    'name' => $t->subject->name,
                    'code' => $t->subject->code,
                ] : null,
                'school_class' => $t->schoolClass ? [
                    'id' => $t->schoolClass->id,
                    'name' => $t->schoolClass->name,
                    'grade_level' => $t->schoolClass->grade_level,
                ] : null,
            ])->values()->toArray(),
            'my_classes' => $myClasses->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'grade_level' => $c->grade_level,
                'students_count' => $c->students_count,
                'subjects' => $c->subjects->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                ])->values()->toArray(),
            ])->values()->toArray(),
        ];
    }
}
