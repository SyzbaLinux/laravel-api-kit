<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property int|null $role_id
 * @property int|null $school_id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property bool $is_active
 * @property string|null $phone
 * @property string|null $avatar
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;

    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'school_id',
        'is_active',
        'phone',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function isSuperAdmin(): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', Role::SUPER_ADMIN);
        }

        return $this->role?->name === Role::SUPER_ADMIN;
    }

    public function isSchoolAdmin(): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', Role::SCHOOL_ADMIN);
        }

        return $this->role?->name === Role::SCHOOL_ADMIN;
    }

    public function hasRole(string $roleName): bool
    {
        // Check pivot roles first, fall back to single role_id
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', $roleName);
        }

        return $this->role?->name === $roleName;
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->role?->permissions()->where('name', $permissionName)->exists() ?? false;
    }
}
