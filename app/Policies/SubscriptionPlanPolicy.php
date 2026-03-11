<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\SubscriptionPlan;
use App\Models\User;

final class SubscriptionPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, SubscriptionPlan $plan): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, SubscriptionPlan $plan): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, SubscriptionPlan $plan): bool
    {
        return $user->isSuperAdmin();
    }
}
