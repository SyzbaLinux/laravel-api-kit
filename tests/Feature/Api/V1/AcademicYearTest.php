<?php

declare(strict_types=1);

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdminForYear(School $school): User
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

function createTeacherForYear(School $school): User
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

function authTokenForYear(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('AcademicYear Index', function (): void {
    it('lists academic years for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        app()->instance('current_school_id', $school->id);
        AcademicYear::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/academic-years');

        $response->assertStatus(200)->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $this->getJson('/api/v1/academic-years')->assertStatus(401);
    });
});

describe('AcademicYear Create', function (): void {
    it('creates an academic year as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/academic-years', [
                'name' => '2026',
                'start_date' => '2026-01-15',
                'end_date' => '2026-12-01',
                'is_current' => false,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true, 'message' => 'Academic year created successfully']);

        $this->assertDatabaseHas('academic_years', [
            'name' => '2026',
            'school_id' => $school->id,
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/academic-years', []);

        $response->assertStatus(422);
    });

    it('denies academic year creation to teachers', function (): void {
        $school = School::factory()->create();
        $user = createTeacherForYear($school);
        $token = authTokenForYear($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/academic-years', [
                'name' => '2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
            ]);

        $response->assertStatus(403);
    });
});

describe('AcademicYear Show', function (): void {
    it('shows an academic year for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/academic-years/{$year->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['id' => $year->id]]);
    });
});

describe('AcademicYear Update', function (): void {
    it('updates an academic year as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/academic-years/{$year->id}", [
                'name' => '2027',
                'start_date' => '2027-01-10',
                'end_date' => '2027-11-30',
                'is_current' => false,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Academic year updated successfully']);

        $this->assertDatabaseHas('academic_years', ['id' => $year->id, 'name' => '2027']);
    });
});

describe('AcademicYear Delete', function (): void {
    it('deletes an academic year as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/academic-years/{$year->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Academic year deleted successfully']);

        $this->assertDatabaseMissing('academic_years', ['id' => $year->id]);
    });
});

describe('AcademicYear Set Current', function (): void {
    it('sets an academic year as current and unsets others', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForYear($school);
        $token = authTokenForYear($user);

        app()->instance('current_school_id', $school->id);

        $year1 = AcademicYear::factory()->create(['school_id' => $school->id, 'is_current' => true]);
        $year2 = AcademicYear::factory()->create(['school_id' => $school->id, 'is_current' => false]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/v1/academic-years/{$year2->id}/set-current");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('academic_years', ['id' => $year2->id, 'is_current' => true]);
        $this->assertDatabaseHas('academic_years', ['id' => $year1->id, 'is_current' => false]);
    });
});

describe('AcademicYear Tenant Isolation', function (): void {
    it('prevents school admin from seeing another school academic years', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdminForYear($schoolA);
        $tokenA = authTokenForYear($userA);

        $yearB = AcademicYear::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/academic-years/{$yearB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});
