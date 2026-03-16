<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\TeacherData;
use App\Http\Controllers\Api\ApiController;
use App\Models\SchoolClass;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Services\TeacherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TeacherController extends ApiController
{
    public function __construct(
        private readonly TeacherService $teacherService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', TeacherProfile::class);

        $teachers = $this->teacherService->list();

        return $this->success($teachers, 'Teachers retrieved successfully');
    }

    public function store(TeacherData $data): JsonResponse
    {
        $this->authorize('create', TeacherProfile::class);

        $teacher = $this->teacherService->create($data);

        return $this->created($teacher, 'Teacher created successfully');
    }

    public function show(User $teacher): JsonResponse
    {
        $this->authorize('viewAny', TeacherProfile::class);

        $teacher = $this->teacherService->findById($teacher->id);

        return $this->success($teacher, 'Teacher retrieved successfully');
    }

    public function update(TeacherData $data, User $teacher): JsonResponse
    {
        $this->authorize('create', TeacherProfile::class);

        $teacher = $this->teacherService->update($teacher, $data);

        return $this->success($teacher, 'Teacher updated successfully');
    }

    public function destroy(User $teacher): JsonResponse
    {
        $this->authorize('create', TeacherProfile::class);

        $this->teacherService->delete($teacher);

        return $this->success(message: 'Teacher deleted successfully');
    }

    public function assignments(User $teacher): JsonResponse
    {
        $this->authorize('viewAny', TeacherProfile::class);

        $classes = SchoolClass::query()
            ->whereHas('subjects', fn ($q) => $q->where('class_subject.teacher_id', $teacher->id))
            ->with(['subjects' => fn ($q) => $q->where('class_subject.teacher_id', $teacher->id)])
            ->get();

        return $this->success($classes, 'Teacher assignments retrieved successfully');
    }

    public function import(Request $request): JsonResponse
    {
        $this->authorize('create', TeacherProfile::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $results = $this->teacherService->importFromCsv($request->file('file'));

        return $this->success($results, 'Teachers imported successfully');
    }
}
