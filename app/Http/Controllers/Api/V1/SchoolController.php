<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\SchoolData;
use App\Http\Controllers\Api\ApiController;
use App\Models\School;
use App\Services\SchoolService;
use Illuminate\Http\JsonResponse;

final class SchoolController extends ApiController
{
    public function __construct(
        private readonly SchoolService $schoolService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', School::class);

        $schools = $this->schoolService->list();

        return $this->success($schools, 'Schools retrieved successfully');
    }

    public function store(SchoolData $data): JsonResponse
    {
        $this->authorize('create', School::class);

        $school = $this->schoolService->create($data);

        return $this->created($school, 'School created successfully');
    }

    public function show(School $school): JsonResponse
    {
        $this->authorize('view', $school);

        $school = $this->schoolService->findById($school->id);

        return $this->success($school, 'School retrieved successfully');
    }

    public function update(SchoolData $data, School $school): JsonResponse
    {
        $this->authorize('update', $school);

        $school = $this->schoolService->update($school, $data);

        return $this->success($school, 'School updated successfully');
    }

    public function destroy(School $school): JsonResponse
    {
        $this->authorize('delete', $school);

        $this->schoolService->delete($school);

        return $this->success(message: 'School deleted successfully');
    }

    public function searchPublic(): JsonResponse
    {
        $search = (string) request()->input('search', '');
        $schools = $this->schoolService->searchPublic($search);

        return $this->success($schools, 'Schools retrieved successfully');
    }

    public function toggleStatus(School $school): JsonResponse
    {
        $this->authorize('toggleStatus', $school);

        $school = $this->schoolService->toggleStatus($school);

        return $this->success($school, 'School status toggled successfully');
    }
}
