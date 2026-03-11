<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Database\Factories\AcademicYearFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property bool $is_current
 * @property int $school_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class AcademicYear extends Model
{
    /** @use HasFactory<AcademicYearFactory> */
    use HasFactory;

    use BelongsToTenant;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_current',
        'school_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * @return HasMany<AcademicTerm, $this>
     */
    public function terms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class);
    }

    /**
     * @return HasMany<SchoolClass, $this>
     */
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }
}
