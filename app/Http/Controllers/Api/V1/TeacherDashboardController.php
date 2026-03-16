<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use App\Services\TeacherDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

final class TeacherDashboardController extends ApiController
{
    public function __construct(
        private readonly TeacherDashboardService $statsService,
    ) {}

    public function stats(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $stats = $this->statsService->getStats($user);

        return $this->success($stats, 'Teacher dashboard stats retrieved successfully');
    }
}
