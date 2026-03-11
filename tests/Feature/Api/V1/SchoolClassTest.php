<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdminForClass(School $school): User
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

function createTeacherForClass(School $school): User
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

function authTokenForClass(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('SchoolClass Index', function (): void {
    it('lists classes for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        app()->instance('current_school_id', $school->id);
        SchoolClass::factory()->count(3)->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/classes');

        $response->assertStatus(200)->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $this->getJson('/api/v1/classes')->assertStatus(401);
    });
});

describe('SchoolClass Create', function (): void {
    it('creates a class as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/classes', [
                'name' => 'Grade 3 A',
                'grade_level' => 'Grade 3',
                'stream' => 'A',
                'capacity' => 35,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true, 'message' => 'Class created successfully']);

        $this->assertDatabaseHas('school_classes', [
            'name' => 'Grade 3 A',
            'school_id' => $school->id,
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        app()->instance('current_school_id', $school->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/classes', []);

        $response->assertStatus(422);
    });

    it('denies class creation to teachers', function (): void {
        $school = School::factory()->create();
        $user = createTeacherForClass($school);
        $token = authTokenForClass($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/classes', [
                'name' => 'Grade 1 A',
                'grade_level' => 'Grade 1',
            ]);

        $response->assertStatus(403);
    });
});

describe('SchoolClass Show', function (): void {
    it('shows a class for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        $class = SchoolClass::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/classes/{$class->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['id' => $class->id]]);
    });
});

describe('SchoolClass Update', function (): void {
    it('updates a class as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        $class = SchoolClass::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/classes/{$class->id}", [
                'name' => 'Grade 4 B',
                'grade_level' => 'Grade 4',
                'stream' => 'B',
                'capacity' => 30,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Class updated successfully']);

        $this->assertDatabaseHas('school_classes', [
            'id' => $class->id,
            'name' => 'Grade 4 B',
        ]);
    });
});

describe('SchoolClass Delete', function (): void {
    it('deletes a class as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        $class = SchoolClass::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/classes/{$class->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Class deleted successfully']);

        $this->assertSoftDeleted('school_classes', ['id' => $class->id]);
    });
});

describe('SchoolClass Tenant Isolation', function (): void {
    it('prevents school admin from seeing another school classes', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdminForClass($schoolA);
        $tokenA = authTokenForClass($userA);

        $classB = SchoolClass::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/classes/{$classB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('SchoolClass Subject Assignment', function (): void {
    it('assigns a subject to a class', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        app()->instance('current_school_id', $school->id);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/classes/{$class->id}/assign-subject", [
                'subject_id' => $subject->id,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('class_subject', [
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
        ]);
    });

    it('removes a subject from a class', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForClass($school);
        $token = authTokenForClass($user);

        app()->instance('current_school_id', $school->id);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $class->subjects()->attach($subject->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/classes/{$class->id}/remove-subject/{$subject->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('class_subject', [
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
        ]);
    });
});
