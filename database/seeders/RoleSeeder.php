<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

final class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => Role::SUPER_ADMIN,
                'display_name' => 'Super Administrator',
                'description' => 'Platform-wide access to all schools and settings',
                'is_system' => true,
            ],
            [
                'name' => Role::SCHOOL_ADMIN,
                'display_name' => 'School Administrator',
                'description' => 'School-wide access to all operations within their school',
                'is_system' => true,
            ],
            [
                'name' => Role::HOD,
                'display_name' => 'Head of Department',
                'description' => 'Department-level access to teachers, subjects, and marks',
                'is_system' => true,
            ],
            [
                'name' => Role::TEACHER,
                'display_name' => 'Teacher',
                'description' => 'Access to assigned classes and subjects',
                'is_system' => true,
            ],
            [
                'name' => Role::CLASS_TEACHER,
                'display_name' => 'Class Teacher',
                'description' => 'Full oversight of assigned class',
                'is_system' => true,
            ],
            [
                'name' => Role::STUDENT,
                'display_name' => 'Student',
                'description' => 'Access to own academic data and learning materials',
                'is_system' => true,
            ],
            [
                'name' => Role::PARENT,
                'display_name' => 'Parent',
                'description' => 'Access to linked children data',
                'is_system' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(
                ['name' => $role['name']],
                $role,
            );
        }
    }
}
