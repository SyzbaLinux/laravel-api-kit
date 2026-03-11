<?php

declare(strict_types=1);

use App\Enums\SchoolStatus;
use App\Models\Role;
use App\Models\School;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSuperAdmin(): User
{
    $role = Role::query()->create([
        'name' => Role::SUPER_ADMIN,
        'display_name' => 'Super Administrator',
        'is_system' => true,
    ]);

    return User::factory()->create([
        'role_id' => $role->id,
        'is_active' => true,
    ]);
}

function createNonAdmin(): User
{
    $role = Role::query()->create([
        'name' => Role::TEACHER,
        'display_name' => 'Teacher',
        'is_system' => true,
    ]);

    return User::factory()->create([
        'role_id' => $role->id,
        'is_active' => true,
    ]);
}

function authenticateAs(User $user): string
{
    return $user->createToken('test-token')->plainTextToken;
}

describe('School Index', function (): void {
    it('lists schools for super admin', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        School::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'slug', 'email', 'status', 'education_level'],
                    ],
                ],
            ]);
    });

    it('denies school listing to non-admin users', function (): void {
        $user = createNonAdmin();
        $token = authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools');

        $response->assertStatus(403);
    });

    it('requires authentication to list schools', function (): void {
        $response = $this->getJson('/api/v1/admin/schools');

        $response->assertStatus(401);
    });
});

describe('School Create', function (): void {
    it('creates a school as super admin', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/schools', [
                'name' => 'Test Primary School',
                'email' => 'info@testschool.co.zw',
                'phone' => '+263771234567',
                'address' => '123 Main Street',
                'city' => 'Harare',
                'province' => 'Harare',
                'country' => 'Zimbabwe',
                'education_level' => 'primary',
                'status' => 'active',
                'max_students' => 500,
                'max_teachers' => 50,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'School created successfully',
            ]);

        $this->assertDatabaseHas('schools', [
            'name' => 'Test Primary School',
            'email' => 'info@testschool.co.zw',
            'slug' => 'test-primary-school',
        ]);
    });

    it('generates unique slugs for schools with same name', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        School::factory()->create(['name' => 'Test School', 'slug' => 'test-school']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/schools', [
                'name' => 'Test School',
                'email' => 'info@testschool2.co.zw',
                'education_level' => 'primary',
                'max_students' => 500,
                'max_teachers' => 50,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('schools', ['slug' => 'test-school-1']);
    });

    it('validates required fields when creating a school', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/schools', []);

        $response->assertStatus(422);
    });

    it('denies school creation to non-admin users', function (): void {
        $user = createNonAdmin();
        $token = authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/schools', [
                'name' => 'Test School',
                'email' => 'info@test.co.zw',
                'education_level' => 'primary',
                'max_students' => 500,
                'max_teachers' => 50,
            ]);

        $response->assertStatus(403);
    });
});

describe('School Show', function (): void {
    it('shows a school for super admin', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/schools/{$school->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $school->id,
                    'name' => $school->name,
                ],
            ]);
    });

    it('returns 404 for non-existent school', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools/99999');

        $response->assertStatus(404);
    });
});

describe('School Update', function (): void {
    it('updates a school as super admin', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/admin/schools/{$school->id}", [
                'name' => 'Updated School Name',
                'email' => $school->email,
                'education_level' => 'secondary',
                'max_students' => 1000,
                'max_teachers' => 100,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'School updated successfully',
            ]);

        $this->assertDatabaseHas('schools', [
            'id' => $school->id,
            'name' => 'Updated School Name',
        ]);
    });
});

describe('School Delete', function (): void {
    it('deletes a school as super admin', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/admin/schools/{$school->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'School deleted successfully',
            ]);

        $this->assertSoftDeleted('schools', ['id' => $school->id]);
    });
});

describe('School Toggle Status', function (): void {
    it('toggles school status from active to inactive', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create(['status' => SchoolStatus::ACTIVE]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/v1/admin/schools/{$school->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $school->refresh();
        expect($school->status)->toBe(SchoolStatus::INACTIVE);
    });

    it('toggles school status from inactive to active', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create(['status' => SchoolStatus::INACTIVE]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/v1/admin/schools/{$school->id}/toggle-status");

        $response->assertStatus(200);

        $school->refresh();
        expect($school->status)->toBe(SchoolStatus::ACTIVE);
    });

    it('denies status toggle to non-admin users', function (): void {
        $user = createNonAdmin();
        $token = authenticateAs($user);

        $school = School::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson("/api/v1/admin/schools/{$school->id}/toggle-status");

        $response->assertStatus(403);
    });
});

describe('School Filtering', function (): void {
    it('filters schools by status', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        School::factory()->count(2)->create(['status' => SchoolStatus::ACTIVE]);
        School::factory()->count(1)->create(['status' => SchoolStatus::INACTIVE]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools?filter[status]=active');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(2);
    });

    it('filters schools by education level', function (): void {
        $user = createSuperAdmin();
        $token = authenticateAs($user);

        School::factory()->count(2)->create(['education_level' => 'primary']);
        School::factory()->count(1)->create(['education_level' => 'secondary']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/schools?filter[education_level]=primary');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        expect(count($data))->toBe(2);
    });
});
