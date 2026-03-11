<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

final class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Perfect for small schools just getting started',
                'max_students' => 200,
                'max_teachers' => 20,
                'max_storage_gb' => 5,
                'features' => [
                    'basic_attendance',
                    'basic_assessments',
                    'report_cards',
                    'email_notifications',
                ],
                'price_monthly' => 29.99,
                'price_yearly' => 299.99,
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'For growing schools that need more features',
                'max_students' => 500,
                'max_teachers' => 50,
                'max_storage_gb' => 25,
                'features' => [
                    'basic_attendance',
                    'basic_assessments',
                    'report_cards',
                    'email_notifications',
                    'sms_notifications',
                    'learning_content',
                    'assignments',
                    'practice_quizzes',
                    'analytics_dashboard',
                ],
                'price_monthly' => 79.99,
                'price_yearly' => 799.99,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large schools with advanced needs',
                'max_students' => 2000,
                'max_teachers' => 200,
                'max_storage_gb' => 100,
                'features' => [
                    'basic_attendance',
                    'basic_assessments',
                    'report_cards',
                    'email_notifications',
                    'sms_notifications',
                    'learning_content',
                    'assignments',
                    'practice_quizzes',
                    'analytics_dashboard',
                    'advanced_analytics',
                    'custom_branding',
                    'api_access',
                    'priority_support',
                    'bulk_import_export',
                ],
                'price_monthly' => 199.99,
                'price_yearly' => 1999.99,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                $plan,
            );
        }
    }
}
