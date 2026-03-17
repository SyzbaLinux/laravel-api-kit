<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $grading_scale_id
 * @property string $grade_letter
 * @property float $min_mark
 * @property float $max_mark
 * @property string|null $descriptor
 * @property float|null $points
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class GradeRange extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'grading_scale_id',
        'grade_letter',
        'min_mark',
        'max_mark',
        'descriptor',
        'points',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_mark' => 'float',
            'max_mark' => 'float',
            'points'   => 'float',
        ];
    }

    /**
     * @return BelongsTo<GradingScale, $this>
     */
    public function gradingScale(): BelongsTo
    {
        return $this->belongsTo(GradingScale::class);
    }
}
