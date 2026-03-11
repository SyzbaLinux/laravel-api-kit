<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $display_name
 * @property string|null $description
 * @property bool $is_system
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class Role extends Model
{
    use HasFactory;

    public const string SUPER_ADMIN = 'super_admin';

    public const string SCHOOL_ADMIN = 'school_admin';

    public const string HOD = 'hod';

    public const string TEACHER = 'teacher';

    public const string CLASS_TEACHER = 'class_teacher';

    public const string STUDENT = 'student';

    public const string PARENT = 'parent';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_system',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Permission, $this>
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
