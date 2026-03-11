<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\SchoolClassData;
use App\Models\SchoolClass;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class SchoolClassService
{
    /**
     * @return LengthAwarePaginator<int, SchoolClass>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(SchoolClass::class)
            ->allowedFilters([
                AllowedFilter::exact('grade_level'),
                AllowedFilter::exact('academic_year_id'),
            ])
            ->allowedSorts(['name', 'grade_level', 'created_at'])
            ->allowedIncludes(['classTeacher', 'academicYear', 'subjects'])
            ->with(['classTeacher', 'academicYear'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): SchoolClass
    {
        return SchoolClass::query()->with(['classTeacher', 'academicYear', 'subjects'])->findOrFail($id);
    }

    public function create(SchoolClassData $data): SchoolClass
    {
        return SchoolClass::query()->create([
            'name' => $data->name,
            'grade_level' => $data->grade_level,
            'stream' => $data->stream,
            'capacity' => $data->capacity,
            'class_teacher_id' => $data->class_teacher_id,
            'academic_year_id' => $data->academic_year_id,
        ]);
    }

    public function update(SchoolClass $schoolClass, SchoolClassData $data): SchoolClass
    {
        $schoolClass->update([
            'name' => $data->name,
            'grade_level' => $data->grade_level,
            'stream' => $data->stream,
            'capacity' => $data->capacity,
            'class_teacher_id' => $data->class_teacher_id,
            'academic_year_id' => $data->academic_year_id,
        ]);

        return $schoolClass->refresh();
    }

    public function delete(SchoolClass $schoolClass): bool
    {
        return (bool) $schoolClass->delete();
    }

    public function assignSubject(SchoolClass $schoolClass, int $subjectId, ?int $teacherId): void
    {
        $schoolClass->subjects()->syncWithoutDetaching([
            $subjectId => ['teacher_id' => $teacherId],
        ]);
    }

    public function removeSubject(SchoolClass $schoolClass, int $subjectId): void
    {
        $schoolClass->subjects()->detach($subjectId);
    }
}
