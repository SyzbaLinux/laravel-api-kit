<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\AcademicTermData;
use App\Http\Controllers\Api\ApiController;
use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Services\AcademicTermService;
use Illuminate\Http\JsonResponse;

final class AcademicTermController extends ApiController
{
    public function __construct(
        private readonly AcademicTermService $academicTermService,
    ) {}

    public function index(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('viewAny', AcademicTerm::class);

        $terms = $this->academicTermService->list($academicYear->id);

        return $this->success($terms, 'Academic terms retrieved successfully');
    }

    public function store(AcademicTermData $data, AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('create', AcademicTerm::class);

        // Override academic_year_id from route
        $termData = new AcademicTermData(
            id: $data->id,
            name: $data->name,
            academic_year_id: $academicYear->id,
            start_date: $data->start_date,
            end_date: $data->end_date,
            is_current: $data->is_current,
        );

        $term = $this->academicTermService->create($termData);

        return $this->created($term, 'Academic term created successfully');
    }

    public function show(AcademicTerm $term): JsonResponse
    {
        $this->authorize('view', $term);

        $term = $this->academicTermService->findById($term->id);

        return $this->success($term, 'Academic term retrieved successfully');
    }

    public function update(AcademicTermData $data, AcademicTerm $term): JsonResponse
    {
        $this->authorize('update', $term);

        $term = $this->academicTermService->update($term, $data);

        return $this->success($term, 'Academic term updated successfully');
    }

    public function destroy(AcademicTerm $term): JsonResponse
    {
        $this->authorize('delete', $term);

        $this->academicTermService->delete($term);

        return $this->success(message: 'Academic term deleted successfully');
    }

    public function setCurrent(AcademicTerm $term): JsonResponse
    {
        $this->authorize('update', $term);

        $term = $this->academicTermService->setCurrent($term);

        return $this->success($term, 'Academic term set as current successfully');
    }
}
