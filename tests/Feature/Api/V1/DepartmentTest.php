<?php

declare(strict_types=1);

use App\Models\Department;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdminForDept(School $school): User
{
    $role = Role::query()->firstOrCreate(
        ['name' => Role::SCHOOL_ADMIN],
        ['display_name' => 'School Administrator', 'is_system' => true]
    );

    return User::factory()->create([
        'role_id' => $role->id,
        'school_id' => $school->id,
        'is_active' => true,
    ]);
}

function createSuperAdminForDept(): User
{
    $role = Role::query()->firstOrCreate(
        ['name' => Role::SUPER_ADMIN],
        ['display_name' => 'Super Administrator', 'is_system' => true]
    );

    return User::factory()->create([
        'role_id' => $role->id,
        'is_active' => true,
    ]);
}

function createTeacherForDept(School $school): User
{
    $role = Role::query()->firstOrCreate(
        ['name' => Role::TEACHER],
        ['display_name' => 'Teacher', 'is_system' => true]
    );

    return User::factory()->create([
        'role_id' => $role->id,
        'school_id' => $school->id,
        'is_active' => true,
    ]);
}

function authTokenForDept(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('Department Index', function (): void {
    it('lists departments for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        app()->instance('current_school_id', $school->id);
        Department::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/departments');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['data' => [['id', 'name', 'school_id']]],
            ]);
    });

    it('requires authentication to list departments', function (): void {
        $response = $this->getJson('/api/v1/departments');

        $response->assertStatus(401);
    });

    it('denies access to users without a valid role', function (): void {
        $school = School::factory()->create();
        // Create a user with no role
        $user = User::factory()->create(['school_id' => $school->id, 'is_active' => true]);
        $token = authTokenForDept($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/departments');

        $response->assertStatus(403);
    });
});

describe('Department Create', function (): void {
    it('creates a department as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/departments', [
                'name' => 'Mathematics Department',
                'description' => 'Handles all mathematics subjects',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Department created successfully',
            ]);

        $this->assertDatabaseHas('departments', [
            'name' => 'Mathematics Department',
            'school_id' => $school->id,
        ]);
    });

    it('validates required fields when creating a department', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/departments', []);

        $response->assertStatus(422);
    });

    it('denies department creation to teachers', function (): void {
        $school = School::factory()->create();
        $user = createTeacherForDept($school);
        $token = authTokenForDept($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/departments', [
                'name' => 'Science Department',
            ]);

        $response->assertStatus(403);
    });
});

describe('Department Show', function (): void {
    it('shows a department for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        $department = Department::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/departments/{$department->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $department->id, 'name' => $department->name],
            ]);
    });

    it('returns 404 for non-existent department', function (): void {
        $user = createSuperAdminForDept();
        $token = authTokenForDept($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/departments/99999');

        $response->assertStatus(404);
    });
});

describe('Department Update', function (): void {
    it('updates a department as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        $department = Department::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/departments/{$department->id}", [
                'name' => 'Updated Department Name',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department updated successfully',
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Updated Department Name',
        ]);
    });
});

describe('Department Delete', function (): void {
    it('deletes a department as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        $department = Department::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/departments/{$department->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Department deleted successfully']);

        $this->assertSoftDeleted('departments', ['id' => $department->id]);
    });
});

describe('Department Tenant Isolation', function (): void {
    it('prevents school admin from seeing another school departments', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdminForDept($schoolA);
        $tokenA = authTokenForDept($userA);

        $deptB = Department::factory()->create(['school_id' => $schoolB->id]);

        // Scoped to school A
        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/departments/{$deptB->id}");

        // Either 403 (policy check) or 404 (global scope hides it)
        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Department Assign HOD', function (): void {
    it('assigns a HOD to a department', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForDept($school);
        $token = authTokenForDept($user);

        $department = Department::factory()->create(['school_id' => $school->id]);
        $hod = User::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/v1/departments/{$department->id}/assign-hod", [
                'hod_id' => $hod->id,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'HOD assigned successfully']);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'hod_id' => $hod->id,
        ]);
    });
});
