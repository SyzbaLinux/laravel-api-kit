<?php

declare(strict_types=1);

namespace App\Enums;

enum AssessmentCategory: string
{
    case CONTINUOUS_ASSESSMENT = 'continuous_assessment';
    case EXAMINATION = 'examination';

    public function label(): string
    {
        return match ($this) {
            self::CONTINUOUS_ASSESSMENT => 'Continuous Assessment',
            self::EXAMINATION => 'Examination',
        };
    }
}
