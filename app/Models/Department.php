<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Database\Factories\DepartmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $school_id
 * @property int|null $hod_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
final class Department extends Model
{
    /** @use HasFactory<DepartmentFactory> */
    use HasFactory;

    use BelongsToTenant;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'school_id',
        'hod_id',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function hod(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hod_id');
    }

    /**
     * @return HasMany<Subject, $this>
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }
}
