<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\AssessmentData;
use App\Http\Controllers\Api\ApiController;
use App\Models\Assessment;
use App\Services\AssessmentService;
use App\Services\MarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AssessmentController extends ApiController
{
    public function __construct(
        private readonly AssessmentService $assessmentService,
        private readonly MarkService $markService,
    ) {}

    public function index(): JsonResponse
    {
        $assessments = $this->assessmentService->list();

        return $this->success($assessments, 'Assessments retrieved successfully');
    }

    public function store(AssessmentData $data): JsonResponse
    {
        $assessment = $this->assessmentService->create($data);

        return $this->created($assessment->load(['assessmentType', 'subject', 'teacher']), 'Assessment created successfully');
    }

    public function show(Assessment $assessment): JsonResponse
    {
        $assessment = $this->assessmentService->findById($assessment->id);

        return $this->success($assessment, 'Assessment retrieved successfully');
    }

    public function update(AssessmentData $data, Assessment $assessment): JsonResponse
    {
        $assessment = $this->assessmentService->update($assessment, $data);

        return $this->success($assessment, 'Assessment updated successfully');
    }

    public function destroy(Assessment $assessment): JsonResponse
    {
        $this->assessmentService->delete($assessment);

        return $this->success(message: 'Assessment deleted successfully');
    }

    public function marks(Assessment $assessment): JsonResponse
    {
        $marks = $this->markService->getMarks($assessment);

        return $this->success([
            'assessment' => $assessment->load(['assessmentType', 'subject', 'schoolClass']),
            'marks'      => $marks,
        ], 'Marks retrieved successfully');
    }

    public function bulkMarks(Request $request, Assessment $assessment): JsonResponse
    {
        $request->validate([
            'marks'               => ['required', 'array'],
            'marks.*.student_id'  => ['required', 'integer', 'exists:users,id'],
            'marks.*.score'       => ['required', 'numeric', 'min:0'],
            'marks.*.comment'     => ['nullable', 'string'],
        ]);

        $saved = $this->markService->bulkSave($assessment, $request->input('marks'));

        return $this->success($saved, 'Marks saved successfully');
    }
}
