<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Services\PlatformStatsService;
use Illuminate\Http\JsonResponse;

final class PlatformController extends ApiController
{
    public function __construct(
        private readonly PlatformStatsService $platformStatsService,
    ) {}

    public function stats(): JsonResponse
    {
        $stats = $this->platformStatsService->getStats();

        return $this->success($stats, 'Platform stats retrieved successfully');
    }

    public function health(): JsonResponse
    {
        $health = $this->platformStatsService->getHealth();

        return $this->success($health, 'Platform is healthy');
    }
}
