<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AcademicTermController;
use App\Http\Controllers\Api\V1\AcademicYearController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PlatformController;
use App\Http\Controllers\Api\V1\SchoolClassController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\SchoolUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Routes for API version 1.
|
*/

// Public institution search (no auth required)
Route::get('public/schools', [SchoolController::class, 'searchPublic'])
    ->name('api.v1.public.schools');

// Location lookups (public — needed for registration forms)
Route::get('locations/countries', [LocationController::class, 'countries'])->name('api.v1.locations.countries');
Route::get('locations/countries/{country}/states', [LocationController::class, 'states'])->name('api.v1.locations.states');
Route::get('locations/states/{state}/cities', [LocationController::class, 'cities'])->name('api.v1.locations.cities');

// Public routes with auth rate limiter (5/min - brute force protection)
Route::middleware('throttle:auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register'])->name('api.v1.register');
    Route::post('login', [AuthController::class, 'login'])->name('api.v1.login');
});

// Protected routes with authenticated rate limiter (120/min)
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function (): void {
    Route::post('logout', [AuthController::class, 'logout'])->name('api.v1.logout');
    Route::get('me', [AuthController::class, 'me'])->name('api.v1.me');

    // Email verification
    Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

// Password reset routes (public with rate limiting)
Route::middleware('throttle:6,1')->group(function (): void {
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.email');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
        ->name('password.reset');
});

// School Administration routes (tenant-scoped)
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function (): void {
    Route::apiResource('departments', DepartmentController::class);
    Route::patch('departments/{department}/assign-hod', [DepartmentController::class, 'assignHod']);

    Route::apiResource('subjects', SubjectController::class);
    Route::post('subjects/{subject}/assign-to-class', [SubjectController::class, 'assignToClass']);
    Route::delete('subjects/{subject}/remove-from-class/{schoolClass}', [SubjectController::class, 'removeFromClass']);

    Route::apiResource('classes', SchoolClassController::class);
    Route::post('classes/{schoolClass}/assign-subject', [SchoolClassController::class, 'assignSubject']);
    Route::delete('classes/{schoolClass}/remove-subject/{subject}', [SchoolClassController::class, 'removeSubject']);

    Route::apiResource('academic-years', AcademicYearController::class);
    Route::patch('academic-years/{academicYear}/set-current', [AcademicYearController::class, 'setCurrent']);
    Route::apiResource('academic-years.terms', AcademicTermController::class)->shallow();
    Route::patch('terms/{term}/set-current', [AcademicTermController::class, 'setCurrent']);

    Route::apiResource('timetables', TimetableController::class);
    Route::post('timetables/check-conflicts', [TimetableController::class, 'checkConflicts']);
});

// Super Admin routes
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->prefix('admin')->group(function (): void {
    Route::apiResource('schools', SchoolController::class);
    Route::patch('schools/{school}/toggle-status', [SchoolController::class, 'toggleStatus'])
        ->name('api.v1.admin.schools.toggle-status');
    Route::apiResource('subscription-plans', SubscriptionPlanController::class);
    Route::get('platform/stats', [PlatformController::class, 'stats'])
        ->name('api.v1.admin.platform.stats');
    Route::get('platform/health', [PlatformController::class, 'health'])
        ->name('api.v1.admin.platform.health');

    // School Users
    Route::get('schools/{school}/users', [SchoolUserController::class, 'index'])->name('api.v1.admin.school-users.index');
    Route::post('schools/{school}/users', [SchoolUserController::class, 'store'])->name('api.v1.admin.school-users.store');
    Route::delete('schools/{school}/users/{user}', [SchoolUserController::class, 'destroy'])->name('api.v1.admin.school-users.destroy');
    Route::get('school-roles', [SchoolUserController::class, 'roles'])->name('api.v1.admin.school-roles');
});
