<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\AssessmentTypeData;
use App\Http\Controllers\Api\ApiController;
use App\Models\AssessmentType;
use App\Services\AssessmentTypeService;
use Illuminate\Http\JsonResponse;

final class AssessmentTypeController extends ApiController
{
    public function __construct(
        private readonly AssessmentTypeService $assessmentTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $types = $this->assessmentTypeService->list();

        return $this->success($types, 'Assessment types retrieved successfully');
    }

    public function store(AssessmentTypeData $data): JsonResponse
    {
        $type = $this->assessmentTypeService->create($data);

        return $this->created($type, 'Assessment type created successfully');
    }

    public function update(AssessmentTypeData $data, AssessmentType $assessmentType): JsonResponse
    {
        $type = $this->assessmentTypeService->update($assessmentType, $data);

        return $this->success($type, 'Assessment type updated successfully');
    }

    public function destroy(AssessmentType $assessmentType): JsonResponse
    {
        $this->assessmentTypeService->delete($assessmentType);

        return $this->success(message: 'Assessment type deleted successfully');
    }
}
