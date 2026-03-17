<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\AssessmentData;
use App\Models\Assessment;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class AssessmentService
{
    /**
     * @return LengthAwarePaginator<int, Assessment>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(Assessment::class)
            ->allowedFilters([
                AllowedFilter::exact('subject_id'),
                AllowedFilter::exact('school_class_id'),
                AllowedFilter::exact('academic_term_id'),
                AllowedFilter::exact('assessment_type_id'),
                AllowedFilter::exact('teacher_id'),
            ])
            ->allowedSorts(['title', 'date', 'created_at'])
            ->with(['assessmentType', 'subject', 'teacher'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): Assessment
    {
        return Assessment::query()
            ->with(['assessmentType', 'subject', 'schoolClass', 'academicTerm', 'teacher'])
            ->findOrFail($id);
    }

    public function create(AssessmentData $data): Assessment
    {
        return Assessment::query()->create([
            'title'              => $data->title,
            'assessment_type_id' => $data->assessment_type_id,
            'subject_id'         => $data->subject_id,
            'school_class_id'    => $data->school_class_id,
            'academic_term_id'   => $data->academic_term_id,
            'max_score'          => $data->max_score,
            'date'               => $data->date,
            'teacher_id'         => $data->teacher_id,
        ]);
    }

    public function update(Assessment $assessment, AssessmentData $data): Assessment
    {
        $assessment->update([
            'title'              => $data->title,
            'assessment_type_id' => $data->assessment_type_id,
            'subject_id'         => $data->subject_id,
            'school_class_id'    => $data->school_class_id,
            'academic_term_id'   => $data->academic_term_id,
            'max_score'          => $data->max_score,
            'date'               => $data->date,
            'teacher_id'         => $data->teacher_id,
        ]);

        return $assessment->refresh();
    }

    public function delete(Assessment $assessment): bool
    {
        return (bool) $assessment->delete();
    }
}
