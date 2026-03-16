<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSchoolAdminForGuardian(School $school): User
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

function guardianToken(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

function ensureParentRole(): void
{
    Role::query()->firstOrCreate(
        ['name' => Role::PARENT],
        ['display_name' => 'Parent', 'is_system' => true]
    );
}

function ensureStudentRoleForGuardian(): void
{
    Role::query()->firstOrCreate(
        ['name' => Role::STUDENT],
        ['display_name' => 'Student', 'is_system' => true]
    );
}

describe('Guardian Index', function (): void {
    it('lists guardians for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        app()->instance('current_school_id', $school->id);

        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        User::factory()->count(2)->create([
            'role_id' => $parentRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/guardians');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $response = $this->getJson('/api/v1/guardians');
        $response->assertStatus(401);
    });
});

describe('Guardian Create', function (): void {
    it('creates a guardian as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/guardians', [
                'name' => 'Mary Guardian',
                'email' => 'mary.guardian@school.com',
                'relationship' => 'mother',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Guardian created successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Mary Guardian',
            'email' => 'mary.guardian@school.com',
            'school_id' => $school->id,
        ]);

        $this->assertDatabaseHas('guardian_profiles', [
            'relationship' => 'mother',
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/guardians', []);

        $response->assertStatus(422);
    });
});

describe('Guardian Show', function (): void {
    it('shows a guardian for school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        $guardian = User::factory()->create([
            'role_id' => $parentRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/guardians/{$guardian->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $guardian->id],
            ]);
    });
});

describe('Guardian Update', function (): void {
    it('updates a guardian as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        $guardian = User::factory()->create([
            'role_id' => $parentRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/guardians/{$guardian->id}", [
                'name' => 'Updated Guardian Name',
                'email' => $guardian->email,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $guardian->id,
            'name' => 'Updated Guardian Name',
        ]);
    });
});

describe('Guardian Delete', function (): void {
    it('deletes a guardian as school admin', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        $guardian = User::factory()->create([
            'role_id' => $parentRole->id,
            'school_id' => $school->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/guardians/{$guardian->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Guardian deleted successfully']);
    });
});

describe('Guardian Link/Unlink Student', function (): void {
    it('links a student to a guardian', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        ensureStudentRoleForGuardian();

        app()->instance('current_school_id', $school->id);

        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        $studentRole = Role::query()->where('name', Role::STUDENT)->first();

        $guardian = User::factory()->create(['role_id' => $parentRole->id, 'school_id' => $school->id]);
        $student = User::factory()->create(['role_id' => $studentRole->id, 'school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/guardians/{$guardian->id}/link-student", [
                'student_id' => $student->id,
                'is_primary' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Student linked to guardian successfully']);

        $this->assertDatabaseHas('guardian_student', [
            'guardian_id' => $guardian->id,
            'student_id' => $student->id,
            'is_primary' => true,
        ]);
    });

    it('unlinks a student from a guardian', function (): void {
        $school = School::factory()->create();
        $admin = makeSchoolAdminForGuardian($school);
        $token = guardianToken($admin);

        ensureParentRole();
        ensureStudentRoleForGuardian();

        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        $studentRole = Role::query()->where('name', Role::STUDENT)->first();

        $guardian = User::factory()->create(['role_id' => $parentRole->id, 'school_id' => $school->id]);
        $student = User::factory()->create(['role_id' => $studentRole->id, 'school_id' => $school->id]);

        // Link first
        \Illuminate\Support\Facades\DB::table('guardian_student')->insert([
            'guardian_id' => $guardian->id,
            'student_id' => $student->id,
            'is_primary' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/guardians/{$guardian->id}/unlink-student/{$student->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('guardian_student', [
            'guardian_id' => $guardian->id,
            'student_id' => $student->id,
        ]);
    });
});
