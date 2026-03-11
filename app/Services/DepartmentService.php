<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\DepartmentData;
use App\Models\Department;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class DepartmentService
{
    /**
     * @return LengthAwarePaginator<int, Department>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(Department::class)
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::exact('hod_id'),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->allowedIncludes(['hod', 'subjects'])
            ->with('hod')
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): Department
    {
        return Department::query()->with('hod')->findOrFail($id);
    }

    public function create(DepartmentData $data): Department
    {
        return Department::query()->create([
            'name' => $data->name,
            'description' => $data->description,
            'hod_id' => $data->hod_id,
        ]);
    }

    public function update(Department $department, DepartmentData $data): Department
    {
        $department->update([
            'name' => $data->name,
            'description' => $data->description,
            'hod_id' => $data->hod_id,
        ]);

        return $department->refresh();
    }

    public function delete(Department $department): bool
    {
        return (bool) $department->delete();
    }

    public function assignHod(Department $department, int $hodId): Department
    {
        $department->update(['hod_id' => $hodId]);

        return $department->refresh();
    }
}
