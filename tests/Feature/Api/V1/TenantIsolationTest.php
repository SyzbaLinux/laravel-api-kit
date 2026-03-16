<?php

declare(strict_types=1);

use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\Role;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSchoolAdmin(School $school): User
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

function createToken(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('Tenant Isolation - Departments', function (): void {
    it('school A admin cannot see school B departments in list', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        Department::factory()->count(3)->create(['school_id' => $schoolA->id]);
        Department::factory()->count(2)->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/departments');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(3);

        $schoolBIds = Department::query()->where('school_id', $schoolB->id)->pluck('id')->toArray();
        $returnedIds = array_column($data, 'id');
        foreach ($schoolBIds as $id) {
            expect($returnedIds)->not->toContain($id);
        }
    });

    it('school A admin cannot access school B department directly', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        $deptB = Department::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/departments/{$deptB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Tenant Isolation - Subjects', function (): void {
    it('school A admin cannot see school B subjects in list', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        Subject::factory()->count(3)->create(['school_id' => $schoolA->id]);
        Subject::factory()->count(2)->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/subjects');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(3);

        $schoolBIds = Subject::query()->where('school_id', $schoolB->id)->pluck('id')->toArray();
        $returnedIds = array_column($data, 'id');
        foreach ($schoolBIds as $id) {
            expect($returnedIds)->not->toContain($id);
        }
    });

    it('school A admin cannot access school B subject directly', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        $subjectB = Subject::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/subjects/{$subjectB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Tenant Isolation - Classes', function (): void {
    it('school A admin cannot see school B classes in list', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        SchoolClass::factory()->count(3)->create(['school_id' => $schoolA->id]);
        SchoolClass::factory()->count(2)->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/classes');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(3);

        $schoolBIds = SchoolClass::query()->withoutGlobalScopes()->where('school_id', $schoolB->id)->pluck('id')->toArray();
        $returnedIds = array_column($data, 'id');
        foreach ($schoolBIds as $id) {
            expect($returnedIds)->not->toContain($id);
        }
    });

    it('school A admin cannot access school B class directly', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        $classB = SchoolClass::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/classes/{$classB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});

describe('Tenant Isolation - Academic Years', function (): void {
    it('school A admin cannot see school B academic years in list', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        AcademicYear::factory()->count(2)->create(['school_id' => $schoolA->id]);
        AcademicYear::factory()->count(2)->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/academic-years');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(2);

        $schoolBIds = AcademicYear::query()->withoutGlobalScopes()->where('school_id', $schoolB->id)->pluck('id')->toArray();
        $returnedIds = array_column($data, 'id');
        foreach ($schoolBIds as $id) {
            expect($returnedIds)->not->toContain($id);
        }
    });

    it('school A admin cannot access school B academic year directly', function (): void {
        $schoolA = School::factory()->create();
        $schoolB = School::factory()->create();

        $userA = createSchoolAdmin($schoolA);
        $tokenA = createToken($userA);

        $yearB = AcademicYear::factory()->create(['school_id' => $schoolB->id]);

        app()->instance('current_school_id', $schoolA->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson("/api/v1/academic-years/{$yearB->id}");

        expect($response->status())->toBeIn([403, 404]);
    });
});
