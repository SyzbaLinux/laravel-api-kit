<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSuperAdminForEnforcement(): User
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

function createSchoolAdminForEnforcement(School $school): User
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

describe('School Usage Endpoint', function (): void {
    it('returns correct usage structure for super admin', function (): void {
        $superAdmin = createSuperAdminForEnforcement();
        $token = $superAdmin->createToken('test-token')->plainTextToken;

        $school = School::factory()->create([
            'max_students' => 500,
            'max_teachers' => 50,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/schools/{$school->id}/usage");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => [
                    'students_count',
                    'teachers_count',
                    'max_students',
                    'max_teachers',
                    'students_within_limit',
                    'teachers_within_limit',
                ],
            ]);
    });

    it('returns max_students and max_teachers from the school (set by subscription plan)', function (): void {
        $superAdmin = createSuperAdminForEnforcement();
        $token = $superAdmin->createToken('test-token')->plainTextToken;

        $plan = SubscriptionPlan::factory()->create([
            'max_students' => 200,
            'max_teachers' => 20,
        ]);

        $school = School::factory()->create([
            'subscription_plan_id' => $plan->id,
            'max_students' => 200,
            'max_teachers' => 20,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/schools/{$school->id}/usage");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'max_students' => 200,
                    'max_teachers' => 20,
                ],
            ]);
    });

    it('returns students_within_limit as true when under limit', function (): void {
        $superAdmin = createSuperAdminForEnforcement();
        $token = $superAdmin->createToken('test-token')->plainTextToken;

        $school = School::factory()->create([
            'max_students' => 500,
            'max_teachers' => 50,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/schools/{$school->id}/usage");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'students_count' => 0,
                    'students_within_limit' => true,
                ],
            ]);
    });

    it('denies access to school admin for usage endpoint', function (): void {
        $school = School::factory()->create();
        $schoolAdmin = createSchoolAdminForEnforcement($school);
        $token = $schoolAdmin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/schools/{$school->id}/usage");

        $response->assertStatus(403);
    });

    it('requires authentication for usage endpoint', function (): void {
        $school = School::factory()->create();

        $response = $this->getJson("/api/v1/admin/schools/{$school->id}/usage");

        $response->assertStatus(401);
    });
});
