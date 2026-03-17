<?php

declare(strict_types=1);

namespace App\Enums;

enum PromotionStatus: string
{
    case PROMOTED        = 'promoted';
    case RETAINED        = 'retained';
    case REQUIRES_SUPPORT = 'requires_support';
}
