<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSchoolAdminForStudent(School $school): User
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

function makeStudentRoleUser(School $school): User
{
    $role = Role::query()->firstOrCreate(
        ['name' => Role::STUDENT],
        ['display_name' => 'Student', 'is_system' => true]
    );

    return User::factory()->create([
        'role_id' => $role->id,
        'school_id' => $school->id,
        'is_active' => true,
    ]);
}

function studentToken(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

function ensureStudentRole(): void
{
    Role::query()->firstOrCreate(
        ['name' => Role::STUDENT],
        ['display_name' => 'Student', 'is_system' => true]
    );
}

describe('Student Index', function (): void {
    it('lists students for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        ensureStudentRole();
        app()->instance('current_school_id', $school->id);

        $studentRole = Role::query()->where('name', Role::STUDENT)->first();
        User::factory()->count(3)->create([
            'role_id' => $studentRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/students');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $response = $this->getJson('/api/v1/students');
        $response->assertStatus(401);
    });
});

describe('Student Create', function (): void {
    it('creates a student as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        ensureStudentRole();
        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/students', [
                'name' => 'Jane Student',
                'email' => 'jane.student@school.com',
                'student_number' => 'STU001',
                'date_of_birth' => '2010-05-15',
                'gender' => 'female',
                'admission_date' => '2024-01-15',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Student created successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Jane Student',
            'email' => 'jane.student@school.com',
            'school_id' => $school->id,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_number' => 'STU001',
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/students', []);

        $response->assertStatus(422);
    });
});

describe('Student Show', function (): void {
    it('shows a student for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        ensureStudentRole();
        $student = makeStudentRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/students/{$student->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $student->id],
            ]);
    });
});

describe('Student Update', function (): void {
    it('updates a student as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        ensureStudentRole();
        $student = makeStudentRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/students/{$student->id}", [
                'name' => 'Updated Student Name',
                'email' => $student->email,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'name' => 'Updated Student Name',
        ]);
    });
});

describe('Student Delete', function (): void {
    it('deletes a student as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForStudent($school);
        $token = studentToken($admin);

        ensureStudentRole();
        $student = makeStudentRoleUser($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/students/{$student->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Student deleted successfully']);
    });
});

describe('Student Tenant Isolation', function (): void {
    it('school A admin cannot see school B students', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $adminA = makeSchoolAdminForStudent($schoolA);
        $tokenA = studentToken($adminA);

        ensureStudentRole();
        $studentRole = Role::query()->where('name', Role::STUDENT)->first();

        User::factory()->count(2)->create(['role_id' => $studentRole->id, 'school_id' => $schoolA->id]);
        User::factory()->count(3)->create(['role_id' => $studentRole->id, 'school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/students');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(2);
    });
});
