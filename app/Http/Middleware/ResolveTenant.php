<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ResolveTenant
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        $schoolId = $this->resolveSchoolId($request);

        if ($schoolId !== null) {
            app()->instance('current_school_id', $schoolId);
        }

        return $next($request);
    }

    private function resolveSchoolId(Request $request): ?int
    {
        // First, check for X-Tenant-ID header
        $headerTenantId = $request->header('X-Tenant-ID');

        if ($headerTenantId !== null) {
            return (int) $headerTenantId;
        }

        // Fall back to authenticated user's school_id
        /** @var User|null $user */
        $user = $request->user();

        return $user?->school_id;
    }
}
