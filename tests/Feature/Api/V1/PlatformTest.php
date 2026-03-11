<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSuperAdminForPlatformTests(): User
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

describe('Platform Stats', function (): void {
    it('returns platform stats for super admin', function (): void {
        $user = createSuperAdminForPlatformTests();
        $token = $user->createToken('test-token')->plainTextToken;

        School::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/platform/stats');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_schools',
                    'active_schools',
                    'inactive_schools',
                    'suspended_schools',
                    'total_users',
                    'total_students',
                    'total_teachers',
                    'plan_distribution',
                ],
            ]);
    });

    it('requires authentication for platform stats', function (): void {
        $response = $this->getJson('/api/v1/admin/platform/stats');

        $response->assertStatus(401);
    });
});

describe('Platform Health', function (): void {
    it('returns platform health for super admin', function (): void {
        $user = createSuperAdminForPlatformTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/platform/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'healthy',
                ],
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'timestamp',
                    'version',
                    'php_version',
                    'laravel_version',
                ],
            ]);
    });

    it('requires authentication for platform health', function (): void {
        $response = $this->getJson('/api/v1/admin/platform/health');

        $response->assertStatus(401);
    });
});
