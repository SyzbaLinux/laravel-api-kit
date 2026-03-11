<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubjectLevel;
use App\Traits\BelongsToTenant;
use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property int|null $department_id
 * @property int $school_id
 * @property SubjectLevel $education_level
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
final class Subject extends Model
{
    /** @use HasFactory<SubjectFactory> */
    use HasFactory;

    use BelongsToTenant;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'department_id',
        'school_id',
        'education_level',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'education_level' => SubjectLevel::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsToMany<SchoolClass, $this>
     */
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject', 'subject_id', 'school_class_id')
            ->withPivot('teacher_id');
    }
}
