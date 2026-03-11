<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\AcademicYearData;
use App\Models\AcademicYear;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\QueryBuilder;

final class AcademicYearService
{
    /**
     * @return LengthAwarePaginator<int, AcademicYear>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(AcademicYear::class)
            ->allowedSorts(['name', 'start_date', 'created_at'])
            ->allowedIncludes(['terms'])
            ->with('terms')
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): AcademicYear
    {
        return AcademicYear::query()->with('terms')->findOrFail($id);
    }

    public function create(AcademicYearData $data): AcademicYear
    {
        return AcademicYear::query()->create([
            'name' => $data->name,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'is_current' => $data->is_current,
        ]);
    }

    public function update(AcademicYear $academicYear, AcademicYearData $data): AcademicYear
    {
        $academicYear->update([
            'name' => $data->name,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'is_current' => $data->is_current,
        ]);

        return $academicYear->refresh();
    }

    public function delete(AcademicYear $academicYear): bool
    {
        return (bool) $academicYear->delete();
    }

    public function setCurrent(AcademicYear $academicYear): AcademicYear
    {
        // Set all other years for the same school to not current
        AcademicYear::query()
            ->where('school_id', $academicYear->school_id)
            ->where('id', '!=', $academicYear->id)
            ->update(['is_current' => false]);

        $academicYear->update(['is_current' => true]);

        return $academicYear->refresh();
    }
}
