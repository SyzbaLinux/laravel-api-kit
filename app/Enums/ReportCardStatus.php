<?php

declare(strict_types=1);

namespace App\Enums;

enum ReportCardStatus: string
{
    case DRAFT     = 'draft';
    case APPROVED  = 'approved';
    case PUBLISHED = 'published';
}
