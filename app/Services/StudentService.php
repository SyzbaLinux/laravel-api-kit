<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\StudentData;
use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class StudentService
{
    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function list(): LengthAwarePaginator
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        return QueryBuilder::for(User::class)
            ->where('school_id', $schoolId)
            ->whereHas('role', fn ($q) => $q->where('name', Role::STUDENT))
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::callback('student_number', function ($query, $value): void {
                    $query->whereHas('studentProfile', fn ($q) => $q->where('student_number', $value));
                }),
                AllowedFilter::callback('class_id', function ($query, $value): void {
                    $query->whereHas('studentProfile', fn ($q) => $q->where('class_id', $value));
                }),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->allowedIncludes(['studentProfile', 'role'])
            ->with(['role', 'studentProfile'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): User
    {
        return User::query()->with(['role', 'studentProfile'])->findOrFail($id);
    }

    public function create(StudentData $data): User
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;

        $role = Role::query()->where('name', Role::STUDENT)->firstOrFail();

        $user = User::query()->create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password ?? str()->random(12)),
            'phone' => $data->phone,
            'role_id' => $role->id,
            'school_id' => $schoolId,
            'is_active' => true,
        ]);

        StudentProfile::query()->create([
            'user_id' => $user->id,
            'school_id' => $schoolId,
            'student_number' => $data->student_number,
            'date_of_birth' => $data->date_of_birth,
            'gender' => $data->gender,
            'class_id' => $data->class_id,
            'parent_id' => $data->parent_id,
            'admission_date' => $data->admission_date,
            'is_active' => true,
        ]);

        return $user->load(['role', 'studentProfile']);
    }

    public function update(User $student, StudentData $data): User
    {
        $updateData = [
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
        ];

        if ($data->password !== null && $data->password !== '') {
            $updateData['password'] = Hash::make($data->password);
        }

        $student->update($updateData);

        if ($student->studentProfile !== null) {
            $student->studentProfile->update([
                'student_number' => $data->student_number,
                'date_of_birth' => $data->date_of_birth,
                'gender' => $data->gender,
                'class_id' => $data->class_id,
                'parent_id' => $data->parent_id,
                'admission_date' => $data->admission_date,
            ]);
        }

        return $student->refresh()->load(['role', 'studentProfile']);
    }

    public function delete(User $student): bool
    {
        return (bool) $student->delete();
    }

    public function transfer(User $student, int $newClassId, ?int $academicYearId = null): void
    {
        // Remove from current class enrollment if exists
        if ($student->studentProfile?->class_id !== null) {
            $currentClass = \App\Models\SchoolClass::find($student->studentProfile->class_id);
            $currentClass?->students()->detach($student->id);
        }

        $this->enroll($student, $newClassId, $academicYearId);
    }

    public function enroll(User $student, int $classId, ?int $academicYearId = null): void
    {
        if ($student->studentProfile !== null) {
            $student->studentProfile->update(['class_id' => $classId]);
        }

        $student->load('studentProfile');

        // Also add to class_enrollments pivot
        /** @var \App\Models\SchoolClass $schoolClass */
        $schoolClass = \App\Models\SchoolClass::query()->findOrFail($classId);
        $schoolClass->students()->syncWithoutDetaching([
            $student->id => [
                'academic_year_id' => $academicYearId,
                'enrolled_at' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * @return array{imported: int, errors: list<string>}
     */
    public function importFromCsv(UploadedFile $file): array
    {
        $schoolId = app()->bound('current_school_id') ? app('current_school_id') : Auth::user()?->school_id;
        $role = Role::query()->where('name', Role::STUDENT)->firstOrFail();

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
            $studentNumber = trim((string) ($data[3] ?? '')) ?: null;
            $dateOfBirth = trim((string) ($data[4] ?? '')) ?: null;
            $gender = trim((string) ($data[5] ?? '')) ?: null;
            $admissionDate = trim((string) ($data[6] ?? '')) ?: null;

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

            StudentProfile::query()->create([
                'user_id' => $user->id,
                'school_id' => $schoolId,
                'student_number' => $studentNumber,
                'date_of_birth' => $dateOfBirth,
                'gender' => $gender,
                'admission_date' => $admissionDate,
                'is_active' => true,
            ]);

            $imported++;
        }

        fclose($handle);

        return ['imported' => $imported, 'errors' => $errors];
    }
}
