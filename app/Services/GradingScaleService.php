<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GradingScaleData;
use App\Models\GradeRange;
use App\Models\GradingScale;
use Illuminate\Pagination\LengthAwarePaginator;

final class GradingScaleService
{
    /**
     * @return LengthAwarePaginator<int, GradingScale>
     */
    public function list(): LengthAwarePaginator
    {
        return GradingScale::query()
            ->withCount('gradeRanges')
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): GradingScale
    {
        return GradingScale::query()
            ->with('gradeRanges')
            ->findOrFail($id);
    }

    public function create(GradingScaleData $data): GradingScale
    {
        if ($data->is_default) {
            $this->clearDefaults();
        }

        return GradingScale::query()->create([
            'name'       => $data->name,
            'is_default' => $data->is_default,
        ]);
    }

    public function update(GradingScale $scale, GradingScaleData $data): GradingScale
    {
        if ($data->is_default) {
            $this->clearDefaults($scale->id);
        }

        $scale->update([
            'name'       => $data->name,
            'is_default' => $data->is_default,
        ]);

        return $scale->refresh();
    }

    public function delete(GradingScale $scale): bool
    {
        return (bool) $scale->delete();
    }

    public function setDefault(GradingScale $scale): GradingScale
    {
        $this->clearDefaults($scale->id);
        $scale->update(['is_default' => true]);

        return $scale->refresh();
    }

    /**
     * @param  array<int, array<string, mixed>>  $ranges
     */
    public function syncRanges(GradingScale $scale, array $ranges): GradingScale
    {
        $scale->gradeRanges()->delete();

        foreach ($ranges as $range) {
            GradeRange::query()->create([
                'grading_scale_id' => $scale->id,
                'grade_letter'     => $range['grade_letter'],
                'min_mark'         => $range['min_mark'],
                'max_mark'         => $range['max_mark'],
                'descriptor'       => $range['descriptor'] ?? null,
                'points'           => $range['points'] ?? null,
            ]);
        }

        return $scale->load('gradeRanges');
    }

    public function resolveGrade(GradingScale $scale, float $mark): ?GradeRange
    {
        return $scale->gradeRanges
            ->first(fn (GradeRange $r) => $mark >= $r->min_mark && $mark <= $r->max_mark);
    }

    private function clearDefaults(?int $exceptId = null): void
    {
        $schoolId = app('current_school_id');

        $query = GradingScale::query()
            ->withoutGlobalScope('tenant')
            ->where('school_id', $schoolId)
            ->where('is_default', true);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        $query->update(['is_default' => false]);
    }
}
