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
            'total_schools' => School::query()->count(),
            'active_schools' => School::query()->where('status', SchoolStatus::ACTIVE)->count(),
            'inactive_schools' => School::query()->where('status', SchoolStatus::INACTIVE)->count(),
            'suspended_schools' => School::query()->where('status', SchoolStatus::SUSPENDED)->count(),
            'total_users' => User::query()->count(),
            'total_students' => User::query()->whereHas('role', fn ($q) => $q->where('name', Role::STUDENT))->count(),
            'total_teachers' => User::query()->whereHas('role', fn ($q) => $q->whereIn('name', [Role::TEACHER, Role::CLASS_TEACHER]))->count(),
            'plan_distribution' => $this->getPlanDistribution(),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function getPlanDistribution(): array
    {
        $plans = SubscriptionPlan::query()
            ->withCount('schools')
            ->get();

        $distribution = [];
        foreach ($plans as $plan) {
            $distribution[$plan->name] = $plan->schools_count;
        }

        $distribution['no_plan'] = School::query()->whereNull('subscription_plan_id')->count();

        return $distribution;
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
