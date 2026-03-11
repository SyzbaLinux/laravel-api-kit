<?php

declare(strict_types=1);

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdminForTimetable(School $school): User
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

function createTeacherForTimetable(School $school): User
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

function authTokenForTimetable(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

function makeTimetablePayload(School $school): array
{
    $year = AcademicYear::factory()->create(['school_id' => $school->id]);
    $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
    $class = SchoolClass::factory()->create(['school_id' => $school->id]);
    $subject = Subject::factory()->create(['school_id' => $school->id]);
    $teacher = User::factory()->create(['school_id' => $school->id]);

    return [
        'school_class_id' => $class->id,
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'academic_term_id' => $term->id,
        'day_of_week' => 1,
        'start_time' => '08:00',
        'end_time' => '09:00',
    ];
}

describe('Timetable Index', function (): void {
    it('lists timetable entries for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);
        $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::factory()->create(['school_id' => $school->id]);

        Timetable::factory()->count(2)->create([
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'academic_term_id' => $term->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/timetables?class_id={$class->id}");

        $response->assertStatus(200)->assertJson(['success' => true]);
    });

    it('requires authentication', function (): void {
        $this->getJson('/api/v1/timetables')->assertStatus(401);
    });
});

describe('Timetable Create', function (): void {
    it('creates a timetable entry as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        app()->instance('current_school_id', $school->id);
        $payload = makeTimetablePayload($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/timetables', $payload);

        $response->assertStatus(201)
            ->assertJson(['success' => true, 'message' => 'Timetable entry created successfully']);

        $this->assertDatabaseHas('timetables', [
            'school_class_id' => $payload['school_class_id'],
            'subject_id' => $payload['subject_id'],
            'day_of_week' => 1,
        ]);
    });

    it('validates required fields', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/timetables', []);

        $response->assertStatus(422);
    });

    it('denies timetable creation to teachers', function (): void {
        $school = School::factory()->create();
        $user = createTeacherForTimetable($school);
        $token = authTokenForTimetable($user);

        app()->instance('current_school_id', $school->id);
        $payload = makeTimetablePayload($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/timetables', $payload);

        $response->assertStatus(403);
    });

    it('rejects timetable with scheduling conflicts', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        app()->instance('current_school_id', $school->id);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);
        $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::factory()->create(['school_id' => $school->id]);

        // Create existing timetable entry
        Timetable::factory()->create([
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'academic_term_id' => $term->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        // Attempt to create conflicting entry for same teacher
        $subject2 = Subject::factory()->create(['school_id' => $school->id]);
        $class2 = SchoolClass::factory()->create(['school_id' => $school->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/timetables', [
                'school_class_id' => $class2->id,
                'subject_id' => $subject2->id,
                'teacher_id' => $teacher->id,
                'academic_term_id' => $term->id,
                'day_of_week' => 1,
                'start_time' => '08:30',
                'end_time' => '09:30',
            ]);

        $response->assertStatus(422);
    });
});

describe('Timetable Show', function (): void {
    it('shows a timetable entry for school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);
        $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::factory()->create(['school_id' => $school->id]);

        $timetable = Timetable::factory()->create([
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'academic_term_id' => $term->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/timetables/{$timetable->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['id' => $timetable->id]]);
    });
});

describe('Timetable Update', function (): void {
    it('updates a timetable entry as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        app()->instance('current_school_id', $school->id);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);
        $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::factory()->create(['school_id' => $school->id]);

        $timetable = Timetable::factory()->create([
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'academic_term_id' => $term->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/timetables/{$timetable->id}", [
                'school_class_id' => $class->id,
                'subject_id' => $subject->id,
                'teacher_id' => $teacher->id,
                'academic_term_id' => $term->id,
                'day_of_week' => 2,
                'start_time' => '10:00',
                'end_time' => '11:00',
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Timetable entry updated successfully']);

        $this->assertDatabaseHas('timetables', ['id' => $timetable->id, 'day_of_week' => 2]);
    });
});

describe('Timetable Delete', function (): void {
    it('deletes a timetable entry as school admin', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        $year = AcademicYear::factory()->create(['school_id' => $school->id]);
        $term = AcademicTerm::factory()->create(['academic_year_id' => $year->id]);
        $class = SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::factory()->create(['school_id' => $school->id]);

        $timetable = Timetable::factory()->create([
            'school_class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'academic_term_id' => $term->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/timetables/{$timetable->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Timetable entry deleted successfully']);

        $this->assertDatabaseMissing('timetables', ['id' => $timetable->id]);
    });
});

describe('Timetable Check Conflicts', function (): void {
    it('returns conflict-free result when no conflicts exist', function (): void {
        $school = School::factory()->create();
        $user = createSchoolAdminForTimetable($school);
        $token = authTokenForTimetable($user);

        app()->instance('current_school_id', $school->id);
        $payload = makeTimetablePayload($school);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/timetables/check-conflicts', $payload);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['has_conflicts' => false]]);
    });
});
