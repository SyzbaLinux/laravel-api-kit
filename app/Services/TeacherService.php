<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\TeacherData;
use App\Models\Role;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class TeacherService
{
    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function list(): LengthAwarePaginator
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        return QueryBuilder::for(User::class)
            ->where('school_id', $schoolId)
            ->whereHas('role', fn ($q) => $q->whereIn('name', [Role::TEACHER, Role::CLASS_TEACHER]))
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::callback('employee_number', function ($query, $value): void {
                    $query->whereHas('teacherProfile', fn ($q) => $q->where('employee_number', $value));
                }),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->allowedIncludes(['teacherProfile', 'role'])
            ->with(['role', 'teacherProfile'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): User
    {
        return User::query()->with(['role', 'teacherProfile'])->findOrFail($id);
    }

    public function create(TeacherData $data): User
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        $role = Role::query()->where('name', Role::TEACHER)->firstOrFail();

        $user = User::query()->create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password ?? str()->random(12)),
            'phone' => $data->phone,
            'role_id' => $role->id,
            'school_id' => $schoolId,
            'is_active' => true,
        ]);

        TeacherProfile::query()->create([
            'user_id' => $user->id,
            'school_id' => $schoolId,
            'employee_number' => $data->employee_number,
            'qualification' => $data->qualification,
            'specialization' => $data->specialization,
            'join_date' => $data->join_date,
            'is_active' => true,
        ]);

        return $user->load(['role', 'teacherProfile']);
    }

    public function update(User $teacher, TeacherData $data): User
    {
        $updateData = [
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
        ];

        if ($data->password !== null && $data->password !== '') {
            $updateData['password'] = Hash::make($data->password);
        }

        $teacher->update($updateData);

        if ($teacher->teacherProfile !== null) {
            $teacher->teacherProfile->update([
                'employee_number' => $data->employee_number,
                'qualification' => $data->qualification,
                'specialization' => $data->specialization,
                'join_date' => $data->join_date,
            ]);
        }

        return $teacher->refresh()->load(['role', 'teacherProfile']);
    }

    public function delete(User $teacher): bool
    {
        return (bool) $teacher->delete();
    }

    /**
     * @return array{imported: int, errors: list<string>}
     */
    public function importFromCsv(\Illuminate\Http\UploadedFile $file): array
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;
        $role = Role::query()->where('name', Role::TEACHER)->firstOrFail();

        $imported = 0;
        $errors = [];
        $row = 0;

        $handle = fopen($file->getPathname(), 'r');
        fgetcsv($handle); // skip header row

        while (($data = fgetcsv($handle)) !== false) {
            $row++;

            $name = trim((string) ($data[0] ?? ''));
            $email = trim((string) ($data[1] ?? ''));
            $phone = trim((string) ($data[2] ?? '')) ?: null;
            $employeeNumber = trim((string) ($data[3] ?? '')) ?: null;
            $qualification = trim((string) ($data[4] ?? '')) ?: null;
            $specialization = trim((string) ($data[5] ?? '')) ?: null;
            $joinDate = trim((string) ($data[6] ?? '')) ?: null;

            if ($name === '' || $email === '') {
                $errors[] = "Row {$row}: name and email are required.";
                continue;
            }

            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Row {$row}: invalid email '{$email}'.";
                continue;
            }

            if (User::query()->where('email', $email)->exists()) {
                $errors[] = "Row {$row}: email '{$email}' already exists.";
                continue;
            }

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(str()->random(12)),
                'phone' => $phone,
                'role_id' => $role->id,
                'school_id' => $schoolId,
                'is_active' => true,
            ]);

            TeacherProfile::query()->create([
                'user_id' => $user->id,
                'school_id' => $schoolId,
                'employee_number' => $employeeNumber,
                'qualification' => $qualification,
                'specialization' => $specialization,
                'join_date' => $joinDate,
                'is_active' => true,
            ]);

            $imported++;
        }

        fclose($handle);

        return ['imported' => $imported, 'errors' => $errors];
    }
}
