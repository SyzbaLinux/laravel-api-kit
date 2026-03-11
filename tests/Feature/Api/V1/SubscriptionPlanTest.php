<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createSuperAdminForPlanTests(): User
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

function createNonAdminForPlanTests(): User
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

describe('Subscription Plan Index', function (): void {
    it('lists subscription plans for super admin', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        SubscriptionPlan::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/subscription-plans');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'slug', 'max_students', 'max_teachers', 'price_monthly', 'price_yearly'],
                    ],
                ],
            ]);
    });

    it('denies plan listing to non-admin users', function (): void {
        $user = createNonAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/subscription-plans');

        $response->assertStatus(403);
    });

    it('requires authentication to list plans', function (): void {
        $response = $this->getJson('/api/v1/admin/subscription-plans');

        $response->assertStatus(401);
    });
});

describe('Subscription Plan Create', function (): void {
    it('creates a subscription plan as super admin', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/subscription-plans', [
                'name' => 'Premium Plan',
                'description' => 'A premium subscription plan',
                'max_students' => 1000,
                'max_teachers' => 100,
                'max_storage_gb' => 50,
                'features' => ['attendance', 'reports', 'analytics'],
                'price_monthly' => 99.99,
                'price_yearly' => 999.99,
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Subscription plan created successfully',
            ]);

        $this->assertDatabaseHas('subscription_plans', [
            'name' => 'Premium Plan',
            'slug' => 'premium-plan',
        ]);
    });

    it('validates required fields when creating a plan', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/subscription-plans', []);

        $response->assertStatus(422);
    });
});

describe('Subscription Plan Show', function (): void {
    it('shows a subscription plan for super admin', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $plan = SubscriptionPlan::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/admin/subscription-plans/{$plan->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                ],
            ]);
    });

    it('returns 404 for non-existent plan', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/subscription-plans/99999');

        $response->assertStatus(404);
    });
});

describe('Subscription Plan Update', function (): void {
    it('updates a subscription plan as super admin', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $plan = SubscriptionPlan::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/v1/admin/subscription-plans/{$plan->id}", [
                'name' => 'Updated Plan Name',
                'max_students' => 2000,
                'max_teachers' => 200,
                'price_monthly' => 149.99,
                'price_yearly' => 1499.99,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Subscription plan updated successfully',
            ]);

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan->id,
            'name' => 'Updated Plan Name',
        ]);
    });
});

describe('Subscription Plan Delete', function (): void {
    it('deletes a subscription plan as super admin', function (): void {
        $user = createSuperAdminForPlanTests();
        $token = $user->createToken('test-token')->plainTextToken;

        $plan = SubscriptionPlan::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/v1/admin/subscription-plans/{$plan->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Subscription plan deleted successfully',
            ]);

        $this->assertDatabaseMissing('subscription_plans', ['id' => $plan->id]);
    });
});
