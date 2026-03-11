<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Between;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class TimetableData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, IntegerType]
        public readonly int $school_class_id,
        #[Required, IntegerType]
        public readonly int $subject_id,
        #[Required, IntegerType]
        public readonly int $teacher_id,
        #[Required, IntegerType]
        public readonly int $academic_term_id,
        #[Required, IntegerType, Between(1, 7)]
        public readonly int $day_of_week,
        #[Required, StringType]
        public readonly string $start_time,
        #[Required, StringType]
        public readonly string $end_time,
    ) {}
}
