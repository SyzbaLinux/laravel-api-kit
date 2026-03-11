<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Geo data seeders — disable FK checks because the bundled
        // city/state data has cross-country references not all present.
        DB::statement('PRAGMA foreign_keys = OFF');
        $this->call([
            CountryTableSeeder::class,
            StateTableSeeder::class,
            CitySeeder::class,
            CountryTimezoneSeeder::class,
        ]);
        DB::statement('PRAGMA foreign_keys = ON');

        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            SubscriptionPlanSeeder::class,
        ]);

        // Create super admin user
        $superAdminRole = Role::query()->where('name', Role::SUPER_ADMIN)->first();

        User::query()->updateOrCreate(
            ['email' => 'admin@schoolms.test'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@schoolms.test',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $superAdminRole?->id,
                'is_active' => true,
            ],
        );
    }
}
