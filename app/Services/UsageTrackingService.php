<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\School;

final class UsageTrackingService
{
    /**
     * @return array{students_count: int, teachers_count: int, max_students: int, max_teachers: int, students_within_limit: bool, teachers_within_limit: bool}
     */
    public function getUsage(School $school): array
    {
        $studentsCount = $school->users()
            ->whereHas('role', fn ($q) => $q->where('name', 'student'))
            ->count();

        $teachersCount = $school->users()
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['teacher', 'class_teacher']))
            ->count();

        $maxStudents = $school->max_students;
        $maxTeachers = $school->max_teachers;

        return [
            'students_count' => $studentsCount,
            'teachers_count' => $teachersCount,
            'max_students' => $maxStudents,
            'max_teachers' => $maxTeachers,
            'students_within_limit' => $studentsCount <= $maxStudents,
            'teachers_within_limit' => $teachersCount <= $maxTeachers,
        ];
    }

    public function isWithinStudentLimit(School $school): bool
    {
        $studentsCount = $school->users()
            ->whereHas('role', fn ($q) => $q->where('name', 'student'))
            ->count();

        return $studentsCount < $school->max_students;
    }

    public function isWithinTeacherLimit(School $school): bool
    {
        $teachersCount = $school->users()
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['teacher', 'class_teacher']))
            ->count();

        return $teachersCount < $school->max_teachers;
    }
}
