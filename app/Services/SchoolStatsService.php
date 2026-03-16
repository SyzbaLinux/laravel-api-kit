<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

final class SchoolStatsService
{
    /**
     * @return array<string, mixed>
     */
    public function getStats(): array
    {
        /** @var User $user */
        $user = Auth::user();
        $schoolId = $user->school_id;

        $currentYear = AcademicYear::query()
            ->where('school_id', $schoolId)
            ->where('is_current', true)
            ->with('terms')
            ->first();

        $currentTerm = AcademicTerm::query()
            ->where('is_current', true)
            ->whereHas('academicYear', fn ($q) => $q->where('school_id', $schoolId))
            ->first();

        $studentCount = User::query()
            ->where('school_id', $schoolId)
            ->whereHas('role', fn ($q) => $q->where('name', Role::STUDENT))
            ->count();

        $teacherCount = User::query()
            ->where('school_id', $schoolId)
            ->whereHas('role', fn ($q) => $q->whereIn('name', [Role::TEACHER, Role::CLASS_TEACHER]))
            ->count();

        $departmentCount = Department::query()
            ->where('school_id', $schoolId)
            ->count();

        $subjectCount = Subject::query()
            ->where('school_id', $schoolId)
            ->count();

        $activeSubjectCount = Subject::query()
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->count();

        $classCount = SchoolClass::query()
            ->where('school_id', $schoolId)
            ->count();

        $timetableCount = Timetable::query()
            ->whereHas('schoolClass', fn ($q) => $q->where('school_id', $schoolId))
            ->count();

        // Subjects by department for chart
        $subjectsByDepartment = Department::query()
            ->where('school_id', $schoolId)
            ->withCount('subjects')
            ->orderByDesc('subjects_count')
            ->get()
            ->map(fn ($dept) => [
                'name' => $dept->name,
                'count' => $dept->subjects_count,
            ])
            ->toArray();

        // Unassigned subjects
        $unassignedSubjects = Subject::query()
            ->where('school_id', $schoolId)
            ->whereNull('department_id')
            ->count();

        if ($unassignedSubjects > 0) {
            $subjectsByDepartment[] = ['name' => 'No Department', 'count' => $unassignedSubjects];
        }

        // Classes by grade level for chart
        $classesByGrade = SchoolClass::query()
            ->where('school_id', $schoolId)
            ->selectRaw('grade_level, COUNT(*) as count, SUM(capacity) as total_capacity')
            ->groupBy('grade_level')
            ->orderBy('grade_level')
            ->get()
            ->map(fn ($cls) => [
                'grade' => $cls->grade_level,
                'count' => $cls->count,
                'capacity' => $cls->total_capacity,
            ])
            ->toArray();

        // Subjects by education level for chart
        $subjectsByLevel = Subject::query()
            ->where('school_id', $schoolId)
            ->selectRaw('education_level, COUNT(*) as count')
            ->groupBy('education_level')
            ->get()
            ->map(fn ($s) => [
                'level' => $s->education_level,
                'count' => $s->count,
            ])
            ->toArray();

        // Academic years count
        $academicYearsCount = AcademicYear::query()
            ->where('school_id', $schoolId)
            ->count();

        $termsCount = AcademicTerm::query()
            ->whereHas('academicYear', fn ($q) => $q->where('school_id', $schoolId))
            ->count();

        return [
            'students' => $studentCount,
            'teachers' => $teacherCount,
            'departments' => $departmentCount,
            'subjects' => $subjectCount,
            'active_subjects' => $activeSubjectCount,
            'classes' => $classCount,
            'timetable_entries' => $timetableCount,
            'academic_years' => $academicYearsCount,
            'terms' => $termsCount,
            'current_year' => $currentYear ? [
                'id' => $currentYear->id,
                'name' => $currentYear->name,
                'start_date' => $currentYear->start_date,
                'end_date' => $currentYear->end_date,
                'terms_count' => $currentYear->terms ? count($currentYear->terms) : 0,
            ] : null,
            'current_term' => $currentTerm ? [
                'id' => $currentTerm->id,
                'name' => $currentTerm->name,
                'start_date' => $currentTerm->start_date,
                'end_date' => $currentTerm->end_date,
            ] : null,
            'charts' => [
                'subjects_by_department' => $subjectsByDepartment,
                'classes_by_grade' => $classesByGrade,
                'subjects_by_level' => $subjectsByLevel,
            ],
        ];
    }
}
