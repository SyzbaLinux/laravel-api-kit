<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\GuardianProfile;
use App\Models\Role;
use App\Models\User;

final class GuardianPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->hasRole(Role::SCHOOL_ADMIN)
            || $user->hasRole(Role::TEACHER)
            || $user->hasRole(Role::CLASS_TEACHER);
    }

    public function view(User $user, GuardianProfile $guardianProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->school_id === $guardianProfile->school_id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasRole(Role::SCHOOL_ADMIN);
    }

    public function update(User $user, GuardianProfile $guardianProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $guardianProfile->school_id;
    }

    public function delete(User $user, GuardianProfile $guardianProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $guardianProfile->school_id;
    }
}
