<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\GradingScaleData;
use App\Http\Controllers\Api\ApiController;
use App\Models\GradingScale;
use App\Services\GradingScaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class GradingScaleController extends ApiController
{
    public function __construct(
        private readonly GradingScaleService $gradingScaleService,
    ) {}

    public function index(): JsonResponse
    {
        $scales = $this->gradingScaleService->list();

        return $this->success($scales, 'Grading scales retrieved successfully');
    }

    public function store(GradingScaleData $data): JsonResponse
    {
        $scale = $this->gradingScaleService->create($data);

        return $this->created($scale, 'Grading scale created successfully');
    }

    public function show(GradingScale $gradingScale): JsonResponse
    {
        $scale = $this->gradingScaleService->findById($gradingScale->id);

        return $this->success($scale, 'Grading scale retrieved successfully');
    }

    public function update(GradingScaleData $data, GradingScale $gradingScale): JsonResponse
    {
        $scale = $this->gradingScaleService->update($gradingScale, $data);

        return $this->success($scale, 'Grading scale updated successfully');
    }

    public function destroy(GradingScale $gradingScale): JsonResponse
    {
        $this->gradingScaleService->delete($gradingScale);

        return $this->success(message: 'Grading scale deleted successfully');
    }

    public function setDefault(GradingScale $gradingScale): JsonResponse
    {
        $scale = $this->gradingScaleService->setDefault($gradingScale);

        return $this->success($scale, 'Default grading scale updated');
    }

    public function syncRanges(Request $request, GradingScale $gradingScale): JsonResponse
    {
        $request->validate([
            'ranges'                => ['required', 'array'],
            'ranges.*.grade_letter' => ['required', 'string', 'max:10'],
            'ranges.*.min_mark'     => ['required', 'numeric', 'min:0', 'max:100'],
            'ranges.*.max_mark'     => ['required', 'numeric', 'min:0', 'max:100'],
            'ranges.*.descriptor'   => ['nullable', 'string'],
            'ranges.*.points'       => ['nullable', 'numeric'],
        ]);

        $scale = $this->gradingScaleService->syncRanges($gradingScale, $request->input('ranges'));

        return $this->success($scale, 'Grade ranges updated successfully');
    }
}
