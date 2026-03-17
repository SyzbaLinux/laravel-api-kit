<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SchoolStatus;
use App\Models\Role;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;

final class PlatformStatsService
{
    /**
     * @return array<string, mixed>
     */
    public function getStats(): array
    {
        return [
            'totalSchools' => School::query()->count(),
            'activeSchools' => School::query()->where('status', SchoolStatus::ACTIVE)->count(),
            'inactiveSchools' => School::query()->where('status', SchoolStatus::INACTIVE)->count(),
            'suspendedSchools' => School::query()->where('status', SchoolStatus::SUSPENDED)->count(),
            'totalUsers' => User::query()->count(),
            'totalStudents' => User::query()->whereHas('role', fn ($q) => $q->where('name', Role::STUDENT))->count(),
            'totalTeachers' => User::query()->whereHas('role', fn ($q) => $q->whereIn('name', [Role::TEACHER, Role::CLASS_TEACHER]))->count(),
            'schoolsByPlan' => $this->getSchoolsByPlan(),
            'recentSchools' => $this->getRecentSchools(),
        ];
    }

    /**
     * @return array<int, array{planName: string, count: int}>
     */
    private function getSchoolsByPlan(): array
    {
        $plans = SubscriptionPlan::query()
            ->withCount('schools')
            ->get();

        $result = $plans->map(fn ($plan) => [
            'planName' => $plan->name,
            'count' => $plan->schools_count,
        ])->values()->all();

        $noPlanCount = School::query()->whereNull('subscription_plan_id')->count();
        if ($noPlanCount > 0) {
            $result[] = ['planName' => 'No Plan', 'count' => $noPlanCount];
        }

        return $result;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getRecentSchools(): array
    {
        return School::query()
            ->with('subscriptionPlan:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'slug', 'status', 'education_level', 'subscription_plan_id', 'created_at'])
            ->map(fn ($school) => [
                'id' => (string) $school->id,
                'name' => $school->name,
                'slug' => $school->slug,
                'status' => $school->status->value,
                'education_level' => $school->education_level->value,
                'studentCount' => $school->studentCount,
                'teacherCount' => $school->teacherCount,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function getHealth(): array
    {
        return [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => config('app.version', '1.0.0'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];
    }
}
