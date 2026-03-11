<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\SchoolClassData;
use App\Http\Controllers\Api\ApiController;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Services\SchoolClassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SchoolClassController extends ApiController
{
    public function __construct(
        private readonly SchoolClassService $schoolClassService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', SchoolClass::class);

        $classes = $this->schoolClassService->list();

        return $this->success($classes, 'Classes retrieved successfully');
    }

    public function store(SchoolClassData $data): JsonResponse
    {
        $this->authorize('create', SchoolClass::class);

        $class = $this->schoolClassService->create($data);

        return $this->created($class, 'Class created successfully');
    }

    public function show(SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('view', $schoolClass);

        $schoolClass = $this->schoolClassService->findById($schoolClass->id);

        return $this->success($schoolClass, 'Class retrieved successfully');
    }

    public function update(SchoolClassData $data, SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('update', $schoolClass);

        $schoolClass = $this->schoolClassService->update($schoolClass, $data);

        return $this->success($schoolClass, 'Class updated successfully');
    }

    public function destroy(SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('delete', $schoolClass);

        $this->schoolClassService->delete($schoolClass);

        return $this->success(message: 'Class deleted successfully');
    }

    public function assignSubject(Request $request, SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('update', $schoolClass);

        $request->validate([
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $this->schoolClassService->assignSubject(
            $schoolClass,
            (int) $request->input('subject_id'),
            $request->input('teacher_id') ? (int) $request->input('teacher_id') : null
        );

        return $this->success(message: 'Subject assigned to class successfully');
    }

    public function removeSubject(SchoolClass $schoolClass, Subject $subject): JsonResponse
    {
        $this->authorize('update', $schoolClass);

        $this->schoolClassService->removeSubject($schoolClass, $subject->id);

        return $this->success(message: 'Subject removed from class successfully');
    }
}
