<?php

declare(strict_types=1);

namespace App\Enums;

enum SubjectLevel: string
{
    case ECD = 'ecd';
    case PRIMARY = 'primary';
    case SECONDARY = 'secondary';
    case ALL = 'all';
}
