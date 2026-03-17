<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PromotionStatus;
use App\Enums\ReportCardStatus;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $school_id
 * @property int $student_id
 * @property int $school_class_id
 * @property int $academic_term_id
 * @property ReportCardStatus $status
 * @property float|null $total_marks
 * @property float|null $average
 * @property int|null $position
 * @property string|null $class_teacher_comment
 * @property PromotionStatus|null $promotion_status
 * @property Carbon|null $approved_at
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
final class ReportCard extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'school_id',
        'student_id',
        'school_class_id',
        'academic_term_id',
        'status',
        'total_marks',
        'average',
        'position',
        'class_teacher_comment',
        'promotion_status',
        'approved_at',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status'           => ReportCardStatus::class,
            'promotion_status' => PromotionStatus::class,
            'total_marks'      => 'float',
            'average'          => 'float',
            'position'         => 'integer',
            'approved_at'      => 'datetime',
            'published_at'     => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * @return BelongsTo<SchoolClass, $this>
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * @return BelongsTo<AcademicTerm, $this>
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }
}
