<?php

declare(strict_types=1);

use App\Models\Department;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeRbacUser(string $roleName, ?School $school = null): User
{
    $role = Role::query()->firstOrCreate(
        ['name' => $roleName],
        ['display_name' => ucfirst(str_replace('_', ' ', $roleName)), 'is_system' => true]
    );

    return User::factory()->create([
        'role_id' => $role->id,
        'school_id' => $school?->id,
        'is_active' => true,
    ]);
}

function rbacToken(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('RBAC - Super Admin Access', function (): void {
    it('super_admin can access /api/v1/admin/schools', function (): void {
        $superAdmin = makeRbacUser(Role::SUPER_ADMIN);
        $token = rbacToken($superAdmin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools');

        $response->assertStatus(200);
    });
});

describe('RBAC - School Admin Restricted', function (): void {
    it('school_admin cannot access /api/v1/admin/schools (403)', function (): void {
        $school = School::factory()->create();
        $schoolAdmin = makeRbacUser(Role::SCHOOL_ADMIN, $school);
        $token = rbacToken($schoolAdmin);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools');

        $response->assertStatus(403);
    });

    it('school_admin can create departments', function (): void {
        $school = School::factory()->create();
        $schoolAdmin = makeRbacUser(Role::SCHOOL_ADMIN, $school);
        $token = rbacToken($schoolAdmin);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/departments', [
                'name' => 'Admin Created Department',
                'description' => 'Test',
            ]);

        $response->assertStatus(201);
    });

    it('school_admin can update departments', function (): void {
        $school = School::factory()->create();
        $schoolAdmin = makeRbacUser(Role::SCHOOL_ADMIN, $school);
        $token = rbacToken($schoolAdmin);

        $department = Department::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/departments/{$department->id}", [
                'name' => 'Updated By Admin',
                'description' => 'Updated',
            ]);

        $response->assertStatus(200);
    });

    it('school_admin can delete departments', function (): void {
        $school = School::factory()->create();
        $schoolAdmin = makeRbacUser(Role::SCHOOL_ADMIN, $school);
        $token = rbacToken($schoolAdmin);

        $department = Department::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/departments/{$department->id}");

        $response->assertStatus(200);
    });
});

describe('RBAC - Teacher Permissions', function (): void {
    it('teacher can list departments', function (): void {
        $school = School::factory()->create();
        $teacher = makeRbacUser(Role::TEACHER, $school);
        $token = rbacToken($teacher);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/departments');

        $response->assertStatus(200);
    });

    it('teacher cannot create departments', function (): void {
        $school = School::factory()->create();
        $teacher = makeRbacUser(Role::TEACHER, $school);
        $token = rbacToken($teacher);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/departments', [
                'name' => 'Teacher Created Department',
            ]);

        $response->assertStatus(403);
    });
});

describe('RBAC - HOD Permissions', function (): void {
    it('HOD can view departments', function (): void {
        $school = School::factory()->create();
        $hod = makeRbacUser(Role::HOD, $school);
        $token = rbacToken($hod);

        app()->instance('current_school_id', $school->id);
        Department::factory()->count(2)->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/departments');

        $response->assertStatus(200);
    });
});

describe('RBAC - Unauthenticated Access', function (): void {
    it('unauthenticated user gets 401 on protected routes', function (): void {
        $response = $this->getJson('/api/v1/departments');

        $response->assertStatus(401);
    });

    it('unauthenticated user gets 401 on admin routes', function (): void {
        $response = $this->getJson('/api/v1/admin/schools');

        $response->assertStatus(401);
    });
});
