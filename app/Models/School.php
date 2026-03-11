<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EducationLevel;
use App\Enums\SchoolStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $email
 * @property string|null $phone
 * @property string|null $address
 * @property int|null $city_id
 * @property int|null $state_id
 * @property int|null $country_id
 * @property string|null $logo
 * @property string|null $website
 * @property EducationLevel $education_level
 * @property SchoolStatus $status
 * @property int|null $subscription_plan_id
 * @property int $max_students
 * @property int $max_teachers
 * @property array<string, mixed>|null $settings
 * @property Carbon|null $established_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
final class School extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'city_id',
        'state_id',
        'country_id',
        'logo',
        'website',
        'education_level',
        'status',
        'subscription_plan_id',
        'max_students',
        'max_teachers',
        'settings',
        'established_at',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'studentCount',
        'teacherCount',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'education_level' => EducationLevel::class,
            'status' => SchoolStatus::class,
            'settings' => 'array',
            'established_at' => 'date',
            'max_students' => 'integer',
            'max_teachers' => 'integer',
            'city_id' => 'integer',
            'state_id' => 'integer',
            'country_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<SubscriptionPlan, $this>
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    /**
     * @return BelongsTo<Country, $this>
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @param  Builder<School>  $query
     * @return Builder<School>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SchoolStatus::ACTIVE);
    }

    /**
     * @param  Builder<School>  $query
     * @return Builder<School>
     */
    public function scopeByStatus(Builder $query, SchoolStatus $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Get the count of students in the school.
     */
    public function getStudentCountAttribute(): int
    {
        return $this->users()
            ->whereHas('role', fn ($q) => $q->where('name', 'student'))
            ->count();
    }

    /**
     * Get the count of teachers in the school.
     */
    public function getTeacherCountAttribute(): int
    {
        return $this->users()
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['teacher', 'class_teacher']))
            ->count();
    }
}
