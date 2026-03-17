<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class GradeRangeData extends Data
{
    public function __construct(
        #[Required, StringType, Max(10)]
        public readonly string $grade_letter,
        #[Required, Min(0), Max(100)]
        public readonly float $min_mark,
        #[Required, Min(0), Max(100)]
        public readonly float $max_mark,
        #[Nullable, StringType]
        public readonly ?string $descriptor,
        #[Nullable]
        public readonly ?float $points,
    ) {}
}
