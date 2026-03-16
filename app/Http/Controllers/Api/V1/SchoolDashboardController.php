<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Services\SchoolStatsService;
use Illuminate\Http\JsonResponse;

final class SchoolDashboardController extends ApiController
{
    public function __construct(
        private readonly SchoolStatsService $statsService,
    ) {}

    public function stats(): JsonResponse
    {
        $stats = $this->statsService->getStats();

        return $this->success($stats, 'School stats retrieved successfully');
    }
}
