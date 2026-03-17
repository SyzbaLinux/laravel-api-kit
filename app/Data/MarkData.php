<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class MarkData extends Data
{
    public function __construct(
        #[Required]
        public readonly int $student_id,
        #[Required, Min(0)]
        public readonly float $score,
        #[Nullable, StringType]
        public readonly ?string $comment = null,
    ) {}
}
