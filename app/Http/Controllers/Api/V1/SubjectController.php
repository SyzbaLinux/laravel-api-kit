<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\SubjectData;
use App\Http\Controllers\Api\ApiController;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Services\SubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SubjectController extends ApiController
{
    public function __construct(
        private readonly SubjectService $subjectService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Subject::class);

        $subjects = $this->subjectService->list();

        return $this->success($subjects, 'Subjects retrieved successfully');
    }

    public function store(SubjectData $data): JsonResponse
    {
        $this->authorize('create', Subject::class);

        $subject = $this->subjectService->create($data);

        return $this->created($subject, 'Subject created successfully');
    }

    public function show(Subject $subject): JsonResponse
    {
        $this->authorize('view', $subject);

        $subject = $this->subjectService->findById($subject->id);

        return $this->success($subject, 'Subject retrieved successfully');
    }

    public function update(SubjectData $data, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $subject = $this->subjectService->update($subject, $data);

        return $this->success($subject, 'Subject updated successfully');
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);

        $this->subjectService->delete($subject);

        return $this->success(message: 'Subject deleted successfully');
    }

    public function assignToClass(Request $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $request->validate([
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $this->subjectService->assignToClass(
            $subject,
            (int) $request->input('school_class_id'),
            $request->input('teacher_id') ? (int) $request->input('teacher_id') : null
        );

        return $this->success(message: 'Subject assigned to class successfully');
    }

    public function removeFromClass(Subject $subject, SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('update', $subject);

        $this->subjectService->removeFromClass($subject, $schoolClass->id);

        return $this->success(message: 'Subject removed from class successfully');
    }
}
