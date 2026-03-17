<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\AssessmentCategory;
use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class AssessmentTypeData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Required]
        public readonly AssessmentCategory $category,
        #[Required, Min(0), Max(100)]
        public readonly float $weight,
        #[BooleanType]
        public readonly bool $is_active = true,
    ) {}
}
