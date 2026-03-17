<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Services\ReportCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReportCardController extends ApiController
{
    public function __construct(
        private readonly ReportCardService $reportCardService,
    ) {}

    public function classReportCards(Request $request, SchoolClass $schoolClass): JsonResponse
    {
        $request->validate([
            'term_id' => ['required', 'integer', 'exists:academic_terms,id'],
        ]);

        $termId  = (int) $request->input('term_id');
        $cards   = $this->reportCardService->getClassReportCards($schoolClass->id, $termId);

        return $this->success($cards, 'Report cards retrieved successfully');
    }

    public function show(ReportCard $reportCard): JsonResponse
    {
        $data = $this->reportCardService->getReportCardData(
            $reportCard->student_id,
            $reportCard->academic_term_id,
        );

        return $this->success($data, 'Report card retrieved successfully');
    }

    public function approve(ReportCard $reportCard): JsonResponse
    {
        $card = $this->reportCardService->approve($reportCard, (int) request()->user()?->id);

        return $this->success($card, 'Report card approved successfully');
    }

    public function publish(ReportCard $reportCard): JsonResponse
    {
        $card = $this->reportCardService->publish($reportCard);

        return $this->success($card, 'Report card published successfully');
    }

    public function unpublish(ReportCard $reportCard): JsonResponse
    {
        $card = $this->reportCardService->unpublish($reportCard);

        return $this->success($card, 'Report card unpublished successfully');
    }

    public function updateClassTeacherComment(Request $request, ReportCard $reportCard): JsonResponse
    {
        $request->validate([
            'comment'          => ['required', 'string'],
            'promotion_status' => ['nullable', 'string', 'in:promoted,retained,requires_support'],
        ]);

        $card = $this->reportCardService->updateClassTeacherComment(
            $reportCard,
            $request->string('comment')->toString(),
            $request->input('promotion_status'),
        );

        return $this->success($card, 'Comment updated successfully');
    }
}
