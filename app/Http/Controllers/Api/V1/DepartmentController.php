<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\DepartmentData;
use App\Http\Controllers\Api\ApiController;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DepartmentController extends ApiController
{
    public function __construct(
        private readonly DepartmentService $departmentService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Department::class);

        $departments = $this->departmentService->list();

        return $this->success($departments, 'Departments retrieved successfully');
    }

    public function store(DepartmentData $data): JsonResponse
    {
        $this->authorize('create', Department::class);

        $department = $this->departmentService->create($data);

        return $this->created($department, 'Department created successfully');
    }

    public function show(Department $department): JsonResponse
    {
        $this->authorize('view', $department);

        $department = $this->departmentService->findById($department->id);

        return $this->success($department, 'Department retrieved successfully');
    }

    public function update(DepartmentData $data, Department $department): JsonResponse
    {
        $this->authorize('update', $department);

        $department = $this->departmentService->update($department, $data);

        return $this->success($department, 'Department updated successfully');
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->authorize('delete', $department);

        $this->departmentService->delete($department);

        return $this->success(message: 'Department deleted successfully');
    }

    public function assignHod(Request $request, Department $department): JsonResponse
    {
        $this->authorize('update', $department);

        $request->validate(['hod_id' => ['required', 'integer', 'exists:users,id']]);

        $department = $this->departmentService->assignHod($department, (int) $request->input('hod_id'));

        return $this->success($department, 'HOD assigned successfully');
    }
}
