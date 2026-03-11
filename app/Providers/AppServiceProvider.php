<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Timetable;
use App\Policies\AcademicTermPolicy;
use App\Policies\AcademicYearPolicy;
use App\Policies\DepartmentPolicy;
use App\Policies\SchoolClassPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\TimetablePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->registerPolicies();
    }

    private function registerPolicies(): void
    {
        Gate::policy(Department::class, DepartmentPolicy::class);
        Gate::policy(Subject::class, SubjectPolicy::class);
        Gate::policy(SchoolClass::class, SchoolClassPolicy::class);
        Gate::policy(AcademicYear::class, AcademicYearPolicy::class);
        Gate::policy(AcademicTerm::class, AcademicTermPolicy::class);
        Gate::policy(Timetable::class, TimetablePolicy::class);
    }

    /**
     * Configure the rate limiters for the application.
     */
    private function configureRateLimiting(): void
    {
        // Default API rate limiter - 60 requests per minute
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));

        // Auth endpoints - more restrictive (prevent brute force)
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        // Authenticated user requests - higher limit
        RateLimiter::for('authenticated', fn (Request $request) => $request->user()
            ? Limit::perMinute(120)->by($request->user()->id)
            : Limit::perMinute(60)->by($request->ip()));
    }
}
