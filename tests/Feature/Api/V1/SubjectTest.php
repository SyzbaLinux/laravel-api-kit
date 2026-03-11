<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdminForSubject(School $school): User
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

function createTeacherForSubject(School $school): User
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

function authTokenForSubject(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('Subject Index', function (): void {
    it('lists subjects for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        app()->instance('current_school_id', $school->id);
        Subject::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/subjects');

        $response->assertStatus(200)->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $this->getJson('/api/v1/subjects')->assertStatus(401);
    });
});

describe('Subject Create', function (): void {
    it('creates a subject as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/subjects', [
                'name' => 'Mathematics',
                'code' => 'MATH101',
                'education_level' => 'primary',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true, 'message' => 'Subject created successfully']);

        $this->assertDatabaseHas('subjects', [
            'name' => 'Mathematics',
            'code' => 'MATH101',
            'school_id' => $school->id,
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/subjects', []);

        $response->assertStatus(422);
    });

    it('denies subject creation to teachers', function (): void {
        $school = School::factory()->create();
        $user = createTeacherForSubject($school);
        $token = authTokenForSubject($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/subjects', [
                'name' => 'History',
                'code' => 'HIST101',
                'education_level' => 'secondary',
            ]);

        $response->assertStatus(403);
    });
});

describe('Subject Show', function (): void {
    it('shows a subject for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        $subject = Subject::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/subjects/{$subject->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['id' => $subject->id]]);
    });
});

describe('Subject Update', function (): void {
    it('updates a subject as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        $subject = Subject::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/subjects/{$subject->id}", [
                'name' => 'Advanced Mathematics',
                'code' => 'AMATH201',
                'education_level' => 'secondary',
                'is_active' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Subject updated successfully']);

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'name' => 'Advanced Mathematics',
        ]);
    });
});

describe('Subject Delete', function (): void {
    it('deletes a subject as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        $subject = Subject::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/subjects/{$subject->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Subject deleted successfully']);

        $this->assertSoftDeleted('subjects', ['id' => $subject->id]);
    });
});

describe('Subject Tenant Isolation', function (): void {
    it('prevents school admin from seeing another school subjects', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdminForSubject($schoolA);
        $tokenA = authTokenForSubject($userA);

        $subjectB = Subject::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/subjects/{$subjectB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Subject Assign to Class', function (): void {
    it('assigns a subject to a class', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForSubject($school);
        $token = authTokenForSubject($user);

        app()->instance('current_school_id', $school->id);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/subjects/{$subject->id}/assign-to-class", [
                'school_class_id' => $class->id,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('class_subject', [
            'subject_id' => $subject->id,
            'school_class_id' => $class->id,
        ]);
    });
});
