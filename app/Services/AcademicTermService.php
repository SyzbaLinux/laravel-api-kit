<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\AcademicTermData;
use App\Models\AcademicTerm;
use Illuminate\Database\Eloquent\Collection;

final class AcademicTermService
{
    /**
     * @return Collection<int, AcademicTerm>
     */
    public function list(int $academicYearId): Collection
    {
        return AcademicTerm::query()
            ->where('academic_year_id', $academicYearId)
            ->orderBy('start_date')
            ->get();
    }

    public function findById(int $id): AcademicTerm
    {
        return AcademicTerm::query()->with('academicYear')->findOrFail($id);
    }

    public function create(AcademicTermData $data): AcademicTerm
    {
        return AcademicTerm::query()->create([
            'name' => $data->name,
            'academic_year_id' => $data->academic_year_id,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'is_current' => $data->is_current,
        ]);
    }

    public function update(AcademicTerm $term, AcademicTermData $data): AcademicTerm
    {
        $term->update([
            'name' => $data->name,
            'academic_year_id' => $data->academic_year_id,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'is_current' => $data->is_current,
        ]);

        return $term->refresh();
    }

    public function delete(AcademicTerm $term): bool
    {
        return (bool) $term->delete();
    }

    public function setCurrent(AcademicTerm $term): AcademicTerm
    {
        // Set all other terms for the same academic year to not current
        AcademicTerm::query()
            ->where('academic_year_id', $term->academic_year_id)
            ->where('id', '!=', $term->id)
            ->update(['is_current' => false]);

        $term->update(['is_current' => true]);

        return $term->refresh();
    }
}
