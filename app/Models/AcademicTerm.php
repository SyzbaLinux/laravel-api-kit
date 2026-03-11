<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\AcademicTermFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property int $academic_year_id
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property bool $is_current
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class AcademicTerm extends Model
{
    /** @use HasFactory<AcademicTermFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'academic_year_id',
        'start_date',
        'end_date',
        'is_current',
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
     * @return BelongsTo<AcademicYear, $this>
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * @return HasMany<Timetable, $this>
     */
    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }
}
