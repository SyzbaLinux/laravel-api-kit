<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\StudentData;
use App\Http\Controllers\Api\ApiController;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StudentController extends ApiController
{
    public function __construct(
        private readonly StudentService $studentService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', StudentProfile::class);

        $students = $this->studentService->list();

        return $this->success($students, 'Students retrieved successfully');
    }

    public function store(StudentData $data): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $student = $this->studentService->create($data);

        return $this->created($student, 'Student created successfully');
    }

    public function show(User $student): JsonResponse
    {
        $this->authorize('viewAny', StudentProfile::class);

        $student = $this->studentService->findById($student->id);

        return $this->success($student, 'Student retrieved successfully');
    }

    public function update(StudentData $data, User $student): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $student = $this->studentService->update($student, $data);

        return $this->success($student, 'Student updated successfully');
    }

    public function destroy(User $student): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $this->studentService->delete($student);

        return $this->success(message: 'Student deleted successfully');
    }

    public function enroll(Request $request, User $student): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $request->validate([
            'class_id' => ['required', 'integer'],
            'academic_year_id' => ['nullable', 'integer'],
        ]);

        $this->studentService->enroll(
            $student,
            $request->integer('class_id'),
            $request->integer('academic_year_id') ?: null
        );

        return $this->success(message: 'Student enrolled successfully');
    }

    public function transfer(Request $request, User $student): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $request->validate([
            'class_id' => ['required', 'integer'],
            'academic_year_id' => ['nullable', 'integer'],
        ]);

        $this->studentService->transfer(
            $student,
            $request->integer('class_id'),
            $request->integer('academic_year_id') ?: null
        );

        return $this->success(message: 'Student transferred successfully');
    }

    public function import(Request $request): JsonResponse
    {
        $this->authorize('create', StudentProfile::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $results = $this->studentService->importFromCsv($request->file('file'));

        return $this->success($results, 'Students imported successfully');
    }
}
