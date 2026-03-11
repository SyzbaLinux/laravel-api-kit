<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $max_students
 * @property int $max_teachers
 * @property int $max_storage_gb
 * @property array<int, string>|null $features
 * @property string $price_monthly
 * @property string $price_yearly
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class SubscriptionPlan extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'max_students',
        'max_teachers',
        'max_storage_gb',
        'features',
        'price_monthly',
        'price_yearly',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'features' => 'array',
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'max_students' => 'integer',
            'max_teachers' => 'integer',
            'max_storage_gb' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<School, $this>
     */
    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }
}
