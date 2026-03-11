<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\SchoolUserData;
use App\Models\School;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

final class SchoolUserService
{
    public function list(School $school): LengthAwarePaginator
    {
        return User::query()
            ->where('school_id', $school->id)
            ->with(['roles'])
            ->orderBy('name')
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function create(School $school, SchoolUserData $data): User
    {
        $user = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
            'phone' => $data->phone,
            'school_id' => $school->id,
            'is_active' => true,
        ]);

        if (! empty($data->role_ids)) {
            $user->roles()->sync($data->role_ids);
        }

        return $user->load('roles');
    }

    public function updateRoles(User $user, array $roleIds): User
    {
        $user->roles()->sync($roleIds);

        return $user->load('roles');
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }
}
