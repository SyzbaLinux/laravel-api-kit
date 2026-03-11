<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\SchoolUserData;
use App\Http\Controllers\Api\ApiController;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use App\Services\SchoolUserService;
use Illuminate\Http\JsonResponse;

final class SchoolUserController extends ApiController
{
    public function __construct(
        private readonly SchoolUserService $schoolUserService,
    ) {}

    public function index(School $school): JsonResponse
    {
        $users = $this->schoolUserService->list($school);

        return $this->success($users, 'Users retrieved successfully');
    }

    public function store(SchoolUserData $data, School $school): JsonResponse
    {
        $user = $this->schoolUserService->create($school, $data);

        return $this->created($user, 'User created successfully');
    }

    public function destroy(School $school, User $user): JsonResponse
    {
        $this->schoolUserService->delete($user);

        return $this->success(message: 'User deleted successfully');
    }

    public function roles(): JsonResponse
    {
        $roles = Role::query()
            ->whereIn('name', [
                Role::SCHOOL_ADMIN,
                Role::HOD,
                Role::TEACHER,
                Role::CLASS_TEACHER,
            ])
            ->get(['id', 'name', 'display_name']);

        return $this->success($roles, 'Roles retrieved successfully');
    }
}
