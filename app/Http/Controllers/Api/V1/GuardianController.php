<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\GuardianData;
use App\Http\Controllers\Api\ApiController;
use App\Models\GuardianProfile;
use App\Models\User;
use App\Services\GuardianService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class GuardianController extends ApiController
{
    public function __construct(
        private readonly GuardianService $guardianService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', GuardianProfile::class);

        $guardians = $this->guardianService->list();

        return $this->success($guardians, 'Guardians retrieved successfully');
    }

    public function store(GuardianData $data): JsonResponse
    {
        $this->authorize('create', GuardianProfile::class);

        $guardian = $this->guardianService->create($data);

        return $this->created($guardian, 'Guardian created successfully');
    }

    public function show(User $guardian): JsonResponse
    {
        $this->authorize('viewAny', GuardianProfile::class);

        $guardian = $this->guardianService->findById($guardian->id);

        return $this->success($guardian, 'Guardian retrieved successfully');
    }

    public function update(GuardianData $data, User $guardian): JsonResponse
    {
        $this->authorize('create', GuardianProfile::class);

        $guardian = $this->guardianService->update($guardian, $data);

        return $this->success($guardian, 'Guardian updated successfully');
    }

    public function destroy(User $guardian): JsonResponse
    {
        $this->authorize('create', GuardianProfile::class);

        $this->guardianService->delete($guardian);

        return $this->success(message: 'Guardian deleted successfully');
    }

    public function linkStudent(Request $request, User $guardian): JsonResponse
    {
        $this->authorize('create', GuardianProfile::class);

        $request->validate([
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $this->guardianService->linkStudent(
            $guardian,
            (int) $request->input('student_id'),
            (bool) $request->input('is_primary', false)
        );

        return $this->success(message: 'Student linked to guardian successfully');
    }

    public function unlinkStudent(Request $request, User $guardian, User $student): JsonResponse
    {
        $this->authorize('create', GuardianProfile::class);

        $this->guardianService->unlinkStudent($guardian, $student->id);

        return $this->success(message: 'Student unlinked from guardian successfully');
    }
}
