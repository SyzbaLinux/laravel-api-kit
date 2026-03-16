<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GuardianData;
use App\Models\GuardianProfile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class GuardianService
{
    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function list(): LengthAwarePaginator
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        return QueryBuilder::for(User::class)
            ->where('school_id', $schoolId)
            ->whereHas('role', fn ($q) => $q->where('name', Role::PARENT))
            ->allowedFilters([
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->allowedIncludes(['guardianProfile', 'role'])
            ->with(['role', 'guardianProfile'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): User
    {
        return User::query()->with(['role', 'guardianProfile', 'linkedStudents'])->findOrFail($id);
    }

    public function create(GuardianData $data): User
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        $role = Role::query()->where('name', Role::PARENT)->firstOrFail();

        $user = User::query()->create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password ?? str()->random(12)),
            'phone' => $data->phone,
            'role_id' => $role->id,
            'school_id' => $schoolId,
            'is_active' => true,
        ]);

        GuardianProfile::query()->create([
            'user_id' => $user->id,
            'school_id' => $schoolId,
            'relationship' => $data->relationship ?? 'guardian',
            'is_active' => true,
        ]);

        return $user->load(['role', 'guardianProfile']);
    }

    public function update(User $guardian, GuardianData $data): User
    {
        $updateData = [
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
        ];

        if ($data->password !== null && $data->password !== '') {
            $updateData['password'] = Hash::make($data->password);
        }

        $guardian->update($updateData);

        if ($guardian->guardianProfile !== null) {
            $guardian->guardianProfile->update([
                'relationship' => $data->relationship ?? $guardian->guardianProfile->relationship,
            ]);
        }

        return $guardian->refresh()->load(['role', 'guardianProfile']);
    }

    public function delete(User $guardian): bool
    {
        return (bool) $guardian->delete();
    }

    public function linkStudent(User $guardian, int $studentId, bool $isPrimary = false): void
    {
        $guardian->linkedStudents()->syncWithoutDetaching([
            $studentId => ['is_primary' => $isPrimary],
        ]);
    }

    public function unlinkStudent(User $guardian, int $studentId): void
    {
        $guardian->linkedStudents()->detach($studentId);
    }
}
