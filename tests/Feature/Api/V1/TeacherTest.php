<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSchoolAdminForTeacher(School $school): User
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

function makeTeacherRoleUser(School $school): User
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

function teacherToken(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

function ensureTeacherRole(): void
{
    Role::query()->firstOrCreate(
        ['name' => Role::TEACHER],
        ['display_name' => 'Teacher', 'is_system' => true]
    );
}

describe('Teacher Index', function (): void {
    it('lists teachers for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        ensureTeacherRole();
        app()->instance('current_school_id', $school->id);

        $teacherRole = Role::query()->where('name', Role::TEACHER)->first();
        User::factory()->count(3)->create([
            'role_id' => $teacherRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/teachers');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $response = $this->getJson('/api/v1/teachers');
        $response->assertStatus(401);
    });
});

describe('Teacher Create', function (): void {
    it('creates a teacher as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        ensureTeacherRole();
        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/teachers', [
                'name' => 'John Teacher',
                'email' => 'john.teacher@school.com',
                'password' => 'password123',
                'employee_number' => 'EMP001',
                'qualification' => 'BSc Mathematics',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Teacher created successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Teacher',
            'email' => 'john.teacher@school.com',
            'school_id' => $school->id,
        ]);

        $this->assertDatabaseHas('teacher_profiles', [
            'employee_number' => 'EMP001',
            'qualification' => 'BSc Mathematics',
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/teachers', []);

        $response->assertStatus(422);
    });

    it('denies teacher creation to teacher role', function (): void {
        $school = School::factory()->create();
        $teacher = makeTeacherRoleUser($school);
        $token = teacherToken($teacher);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/teachers', [
                'name' => 'Another Teacher',
                'email' => 'another@school.com',
            ]);

        $response->assertStatus(403);
    });
});

describe('Teacher Show', function (): void {
    it('shows a teacher for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        ensureTeacherRole();
        $teacher = makeTeacherRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/teachers/{$teacher->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $teacher->id],
            ]);
    });
});

describe('Teacher Update', function (): void {
    it('updates a teacher as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        ensureTeacherRole();
        $teacher = makeTeacherRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/teachers/{$teacher->id}", [
                'name' => 'Updated Teacher Name',
                'email' => $teacher->email,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $teacher->id,
            'name' => 'Updated Teacher Name',
        ]);
    });
});

describe('Teacher Delete', function (): void {
    it('deletes a teacher as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForTeacher($school);
        $token = teacherToken($admin);

        ensureTeacherRole();
        $teacher = makeTeacherRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/teachers/{$teacher->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Teacher deleted successfully']);
    });
});

describe('Teacher Tenant Isolation', function (): void {
    it('school A admin cannot see school B teachers', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $adminA = makeSchoolAdminForTeacher($schoolA);
        $tokenA = teacherToken($adminA);

        ensureTeacherRole();
        $teacherRole = Role::query()->where('name', Role::TEACHER)->first();

        User::factory()->count(2)->create(['role_id' => $teacherRole->id, 'school_id' => $schoolA->id]);
        User::factory()->count(3)->create(['role_id' => $teacherRole->id, 'school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/teachers');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(2);
    });
});
