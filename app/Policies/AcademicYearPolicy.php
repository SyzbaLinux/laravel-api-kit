<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\User;

final class AcademicYearPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasRole(Role::SCHOOL_ADMIN) || $user->hasRole(Role::HOD) || $user->hasRole(Role::TEACHER) || $user->hasRole(Role::CLASS_TEACHER);
    }

    public function view(User $user, AcademicYear $academicYear): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->school_id === $academicYear->school_id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasRole(Role::SCHOOL_ADMIN);
    }

    public function update(User $user, AcademicYear $academicYear): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $academicYear->school_id;
    }

    public function delete(User $user, AcademicYear $academicYear): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SCHOOL_ADMIN) && $user->school_id === $academicYear->school_id;
    }
}
