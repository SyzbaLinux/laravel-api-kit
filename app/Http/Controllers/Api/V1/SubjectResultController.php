<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\SchoolClass;
use App\Models\SubjectResult;
use App\Models\User;
use App\Services\ReportCardService;
use App\Services\ResultCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SubjectResultController extends ApiController
{
    public function __construct(
        private readonly ResultCalculationService $resultCalculationService,
        private readonly ReportCardService $reportCardService,
    ) {}

    public function calculate(Request $request, SchoolClass $schoolClass): JsonResponse
    {
        $request->validate([
            'term_id' => ['required', 'integer', 'exists:academic_terms,id'],
        ]);

        $termId = (int) $request->input('term_id');

        $this->resultCalculationService->calculateForClass($schoolClass->id, $termId);

        // Return updated results
        $results = SubjectResult::query()
            ->with(['student', 'subject'])
            ->where('school_class_id', $schoolClass->id)
            ->where('academic_term_id', $termId)
            ->get();

        return $this->success($results, 'Results calculated successfully');
    }

    public function classResults(Request $request, SchoolClass $schoolClass): JsonResponse
    {
        $request->validate([
            'term_id' => ['required', 'integer', 'exists:academic_terms,id'],
        ]);

        $termId = (int) $request->input('term_id');

        $results = SubjectResult::query()
            ->with(['student', 'subject'])
            ->where('school_class_id', $schoolClass->id)
            ->where('academic_term_id', $termId)
            ->get();

        return $this->success($results, 'Class results retrieved successfully');
    }

    public function studentResults(Request $request, User $student): JsonResponse
    {
        $request->validate([
            'term_id' => ['required', 'integer', 'exists:academic_terms,id'],
        ]);

        $termId = (int) $request->input('term_id');

        $results = SubjectResult::query()
            ->with(['subject'])
            ->where('student_id', $student->id)
            ->where('academic_term_id', $termId)
            ->get();

        return $this->success($results, 'Student results retrieved successfully');
    }

    public function updateComment(Request $request, SubjectResult $subjectResult): JsonResponse
    {
        $request->validate([
            'comment' => ['required', 'string'],
        ]);

        $result = $this->reportCardService->updateSubjectComment(
            $subjectResult,
            $request->string('comment')->toString(),
            (int) $request->user()?->id,
        );

        return $this->success($result, 'Comment updated successfully');
    }
}
