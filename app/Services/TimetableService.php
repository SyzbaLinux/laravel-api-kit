<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\TimetableData;
use App\Models\Timetable;
use Illuminate\Database\Eloquent\Collection;

final class TimetableService
{
    /**
     * @return Collection<int, Timetable>
     */
    public function list(int $classId): Collection
    {
        return Timetable::query()
            ->where('school_class_id', $classId)
            ->with(['subject', 'teacher', 'academicTerm'])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    public function findById(int $id): Timetable
    {
        return Timetable::query()->with(['schoolClass', 'subject', 'teacher', 'academicTerm'])->findOrFail($id);
    }

    public function create(TimetableData $data): Timetable
    {
        return Timetable::query()->create([
            'school_class_id' => $data->school_class_id,
            'subject_id' => $data->subject_id,
            'teacher_id' => $data->teacher_id,
            'academic_term_id' => $data->academic_term_id,
            'day_of_week' => $data->day_of_week,
            'start_time' => $data->start_time,
            'end_time' => $data->end_time,
        ]);
    }

    public function update(Timetable $timetable, TimetableData $data): Timetable
    {
        $timetable->update([
            'school_class_id' => $data->school_class_id,
            'subject_id' => $data->subject_id,
            'teacher_id' => $data->teacher_id,
            'academic_term_id' => $data->academic_term_id,
            'day_of_week' => $data->day_of_week,
            'start_time' => $data->start_time,
            'end_time' => $data->end_time,
        ]);

        return $timetable->refresh();
    }

    public function delete(Timetable $timetable): bool
    {
        return (bool) $timetable->delete();
    }

    /**
     * Check for scheduling conflicts.
     * Returns an array of conflict descriptions.
     *
     * @return array<int, string>
     */
    public function checkConflicts(TimetableData $data, ?int $excludeId = null): array
    {
        $conflicts = [];

        $query = Timetable::query()
            ->where('academic_term_id', $data->academic_term_id)
            ->where('day_of_week', $data->day_of_week)
            ->where(function ($q) use ($data): void {
                $q->where(function ($q2) use ($data): void {
                    $q2->where('start_time', '<', $data->end_time)
                        ->where('end_time', '>', $data->start_time);
                });
            });

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        // Check teacher double-booking
        $teacherConflict = (clone $query)
            ->where('teacher_id', $data->teacher_id)
            ->exists();

        if ($teacherConflict) {
            $conflicts[] = 'Teacher is already scheduled during this time slot.';
        }

        // Check class double-booking
        $classConflict = (clone $query)
            ->where('school_class_id', $data->school_class_id)
            ->exists();

        if ($classConflict) {
            $conflicts[] = 'Class already has a lesson scheduled during this time slot.';
        }

        return $conflicts;
    }
}
