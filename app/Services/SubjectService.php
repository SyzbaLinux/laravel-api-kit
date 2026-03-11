<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\SubjectData;
use App\Models\Subject;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class SubjectService
{
    /**
     * @return LengthAwarePaginator<int, Subject>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(Subject::class)
            ->allowedFilters([
                AllowedFilter::exact('department_id'),
                AllowedFilter::exact('education_level'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'created_at', 'is_active'])
            ->allowedIncludes(['department'])
            ->with('department')
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): Subject
    {
        return Subject::query()->with('department')->findOrFail($id);
    }

    public function create(SubjectData $data): Subject
    {
        return Subject::query()->create([
            'name' => $data->name,
            'code' => $data->code,
            'description' => $data->description,
            'department_id' => $data->department_id,
            'education_level' => $data->education_level,
            'is_active' => $data->is_active,
        ]);
    }

    public function update(Subject $subject, SubjectData $data): Subject
    {
        $subject->update([
            'name' => $data->name,
            'code' => $data->code,
            'description' => $data->description,
            'department_id' => $data->department_id,
            'education_level' => $data->education_level,
            'is_active' => $data->is_active,
        ]);

        return $subject->refresh();
    }

    public function delete(Subject $subject): bool
    {
        return (bool) $subject->delete();
    }

    public function assignToClass(Subject $subject, int $classId, ?int $teacherId): void
    {
        $subject->classes()->syncWithoutDetaching([
            $classId => ['teacher_id' => $teacherId],
        ]);
    }

    public function removeFromClass(Subject $subject, int $classId): void
    {
        $subject->classes()->detach($classId);
    }
}
