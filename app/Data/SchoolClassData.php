<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class SchoolClassData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Required, StringType, Max(100)]
        public readonly string $grade_level,
        #[Nullable, StringType, Max(50)]
        public readonly ?string $stream,
        #[Min(1)]
        public readonly int $capacity = 30,
        public readonly ?int $class_teacher_id = null,
        public readonly ?int $academic_year_id = null,
    ) {}
}
