<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin Model
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $query): void {
            $schoolId = app()->bound('current_school_id') ? app('current_school_id') : null;

            if ($schoolId !== null) {
                $query->where($query->getModel()->getTable().'.school_id', $schoolId);
            }
        });

        static::creating(function (Model $model): void {
            $schoolId = app()->bound('current_school_id') ? app('current_school_id') : null;

            if ($schoolId !== null && ! $model->getAttribute('school_id')) {
                $model->setAttribute('school_id', $schoolId);
            }
        });
    }

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
