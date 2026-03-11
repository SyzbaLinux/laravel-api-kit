<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

final class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // School management
            ['name' => 'schools.view', 'display_name' => 'View Schools', 'module' => 'schools'],
            ['name' => 'schools.create', 'display_name' => 'Create Schools', 'module' => 'schools'],
            ['name' => 'schools.update', 'display_name' => 'Update Schools', 'module' => 'schools'],
            ['name' => 'schools.delete', 'display_name' => 'Delete Schools', 'module' => 'schools'],

            // Subscription plans
            ['name' => 'plans.view', 'display_name' => 'View Plans', 'module' => 'plans'],
            ['name' => 'plans.create', 'display_name' => 'Create Plans', 'module' => 'plans'],
            ['name' => 'plans.update', 'display_name' => 'Update Plans', 'module' => 'plans'],
            ['name' => 'plans.delete', 'display_name' => 'Delete Plans', 'module' => 'plans'],

            // User management
            ['name' => 'users.view', 'display_name' => 'View Users', 'module' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'module' => 'users'],
            ['name' => 'users.update', 'display_name' => 'Update Users', 'module' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'module' => 'users'],

            // Departments
            ['name' => 'departments.view', 'display_name' => 'View Departments', 'module' => 'departments'],
            ['name' => 'departments.create', 'display_name' => 'Create Departments', 'module' => 'departments'],
            ['name' => 'departments.update', 'display_name' => 'Update Departments', 'module' => 'departments'],
            ['name' => 'departments.delete', 'display_name' => 'Delete Departments', 'module' => 'departments'],

            // Subjects
            ['name' => 'subjects.view', 'display_name' => 'View Subjects', 'module' => 'subjects'],
            ['name' => 'subjects.create', 'display_name' => 'Create Subjects', 'module' => 'subjects'],
            ['name' => 'subjects.update', 'display_name' => 'Update Subjects', 'module' => 'subjects'],
            ['name' => 'subjects.delete', 'display_name' => 'Delete Subjects', 'module' => 'subjects'],

            // Classes
            ['name' => 'classes.view', 'display_name' => 'View Classes', 'module' => 'classes'],
            ['name' => 'classes.create', 'display_name' => 'Create Classes', 'module' => 'classes'],
            ['name' => 'classes.update', 'display_name' => 'Update Classes', 'module' => 'classes'],
            ['name' => 'classes.delete', 'display_name' => 'Delete Classes', 'module' => 'classes'],

            // Academic terms
            ['name' => 'terms.view', 'display_name' => 'View Terms', 'module' => 'terms'],
            ['name' => 'terms.create', 'display_name' => 'Create Terms', 'module' => 'terms'],
            ['name' => 'terms.update', 'display_name' => 'Update Terms', 'module' => 'terms'],
            ['name' => 'terms.delete', 'display_name' => 'Delete Terms', 'module' => 'terms'],

            // Attendance
            ['name' => 'attendance.view', 'display_name' => 'View Attendance', 'module' => 'attendance'],
            ['name' => 'attendance.record', 'display_name' => 'Record Attendance', 'module' => 'attendance'],

            // Assessments
            ['name' => 'assessments.view', 'display_name' => 'View Assessments', 'module' => 'assessments'],
            ['name' => 'assessments.create', 'display_name' => 'Create Assessments', 'module' => 'assessments'],
            ['name' => 'assessments.update', 'display_name' => 'Update Assessments', 'module' => 'assessments'],
            ['name' => 'assessments.grade', 'display_name' => 'Grade Assessments', 'module' => 'assessments'],

            // Reports
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'module' => 'reports'],
            ['name' => 'reports.generate', 'display_name' => 'Generate Reports', 'module' => 'reports'],
            ['name' => 'reports.publish', 'display_name' => 'Publish Reports', 'module' => 'reports'],

            // Platform stats
            ['name' => 'platform.stats', 'display_name' => 'View Platform Stats', 'module' => 'platform'],
            ['name' => 'platform.health', 'display_name' => 'View Platform Health', 'module' => 'platform'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['name' => $permission['name']],
                $permission,
            );
        }

        // Assign all permissions to super_admin
        $superAdminRole = Role::query()->where('name', Role::SUPER_ADMIN)->first();
        if ($superAdminRole) {
            $allPermissionIds = Permission::query()->pluck('id')->toArray();
            $superAdminRole->permissions()->sync($allPermissionIds);
        }

        // Assign school-level permissions to school_admin
        $schoolAdminRole = Role::query()->where('name', Role::SCHOOL_ADMIN)->first();
        if ($schoolAdminRole) {
            $schoolPermissions = Permission::query()
                ->whereIn('module', ['users', 'departments', 'subjects', 'classes', 'terms', 'attendance', 'assessments', 'reports'])
                ->pluck('id')
                ->toArray();
            $schoolAdminRole->permissions()->sync($schoolPermissions);
        }

        // Assign HOD permissions
        $hodRole = Role::query()->where('name', Role::HOD)->first();
        if ($hodRole) {
            $hodPermissions = Permission::query()
                ->whereIn('name', [
                    'users.view', 'departments.view', 'subjects.view', 'subjects.update',
                    'classes.view', 'assessments.view', 'assessments.create', 'assessments.update',
                    'assessments.grade', 'attendance.view', 'reports.view',
                ])
                ->pluck('id')
                ->toArray();
            $hodRole->permissions()->sync($hodPermissions);
        }

        // Assign teacher permissions
        $teacherRole = Role::query()->where('name', Role::TEACHER)->first();
        if ($teacherRole) {
            $teacherPermissions = Permission::query()
                ->whereIn('name', [
                    'classes.view', 'subjects.view', 'attendance.view', 'attendance.record',
                    'assessments.view', 'assessments.create', 'assessments.grade', 'reports.view',
                ])
                ->pluck('id')
                ->toArray();
            $teacherRole->permissions()->sync($teacherPermissions);
        }

        // Assign class teacher permissions (same as teacher + extra)
        $classTeacherRole = Role::query()->where('name', Role::CLASS_TEACHER)->first();
        if ($classTeacherRole) {
            $classTeacherPermissions = Permission::query()
                ->whereIn('name', [
                    'classes.view', 'subjects.view', 'users.view',
                    'attendance.view', 'attendance.record',
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.grade',
                    'reports.view', 'reports.generate',
                ])
                ->pluck('id')
                ->toArray();
            $classTeacherRole->permissions()->sync($classTeacherPermissions);
        }

        // Assign student permissions
        $studentRole = Role::query()->where('name', Role::STUDENT)->first();
        if ($studentRole) {
            $studentPermissions = Permission::query()
                ->whereIn('name', [
                    'classes.view', 'subjects.view', 'attendance.view',
                    'assessments.view', 'reports.view',
                ])
                ->pluck('id')
                ->toArray();
            $studentRole->permissions()->sync($studentPermissions);
        }

        // Assign parent permissions
        $parentRole = Role::query()->where('name', Role::PARENT)->first();
        if ($parentRole) {
            $parentPermissions = Permission::query()
                ->whereIn('name', [
                    'attendance.view', 'assessments.view', 'reports.view',
                ])
                ->pluck('id')
                ->toArray();
            $parentRole->permissions()->sync($parentPermissions);
        }
    }
}
