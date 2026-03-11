<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\AcademicYearData;
use App\Http\Controllers\Api\ApiController;
use App\Models\AcademicYear;
use App\Services\AcademicYearService;
use Illuminate\Http\JsonResponse;

final class AcademicYearController extends ApiController
{
    public function __construct(
        private readonly AcademicYearService $academicYearService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AcademicYear::class);

        $years = $this->academicYearService->list();

        return $this->success($years, 'Academic years retrieved successfully');
    }

    public function store(AcademicYearData $data): JsonResponse
    {
        $this->authorize('create', AcademicYear::class);

        $year = $this->academicYearService->create($data);

        return $this->created($year, 'Academic year created successfully');
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('view', $academicYear);

        $academicYear = $this->academicYearService->findById($academicYear->id);

        return $this->success($academicYear, 'Academic year retrieved successfully');
    }

    public function update(AcademicYearData $data, AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('update', $academicYear);

        $academicYear = $this->academicYearService->update($academicYear, $data);

        return $this->success($academicYear, 'Academic year updated successfully');
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('delete', $academicYear);

        $this->academicYearService->delete($academicYear);

        return $this->success(message: 'Academic year deleted successfully');
    }

    public function setCurrent(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('update', $academicYear);

        $academicYear = $this->academicYearService->setCurrent($academicYear);

        return $this->success($academicYear, 'Academic year set as current successfully');
    }
}
