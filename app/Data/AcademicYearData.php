<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class AcademicYearData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(50)]
        public readonly string $name,
        #[Required, StringType]
        public readonly string $start_date,
        #[Required, StringType]
        public readonly string $end_date,
        public readonly bool $is_current = false,
    ) {}
}
