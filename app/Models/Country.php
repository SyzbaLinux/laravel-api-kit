<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $iso
 * @property string $name
 * @property string $nicename
 * @property string|null $iso3
 * @property int|null $numcode
 * @property int $phonecode
 * @property string|null $timezone
 * @property array<string>|null $timezones
 */
final class Country extends Model
{
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'iso',
        'name',
        'nicename',
        'iso3',
        'numcode',
        'phonecode',
        'timezone',
        'timezones',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'numcode' => 'integer',
            'phonecode' => 'integer',
            'timezones' => 'array',
        ];
    }

    /**
     * @return HasMany<State, $this>
     */
    public function states(): HasMany
    {
        return $this->hasMany(State::class);
    }

    /**
     * @return HasMany<School, $this>
     */
    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }
}
