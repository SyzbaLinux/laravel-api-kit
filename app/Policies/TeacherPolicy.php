<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Role;
use App\Models\TeacherProfile;
use App\Models\User;

final class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->hasRole(Role::SCHOOL_ADMIN)
            || $user->hasRole(Role::HOD)
            || $user->hasRole(Role::TEACHER);
    }

    public function view(User $user, TeacherProfile $teacherProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->school_id === $teacherProfile->school_id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasRole(Role::SCHOOL_ADMIN);
    }

    public function update(User $user, TeacherProfile $teacherProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $teacherProfile->school_id;
    }

    public function delete(User $user, TeacherProfile $teacherProfile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $teacherProfile->school_id;
    }
}
