<?php

declare(strict_types=1);

namespace App\Enums;

enum EducationLevel: string
{
    case ECD = 'ecd';
    case PRIMARY = 'primary';
    case SECONDARY = 'secondary';
    case COMBINED = 'combined';

    public function label(): string
    {
        return match ($this) {
            self::ECD => 'ECD (Infant)',
            self::PRIMARY => 'Primary',
            self::SECONDARY => 'Secondary',
            self::COMBINED => 'Combined',
        };
    }
}
