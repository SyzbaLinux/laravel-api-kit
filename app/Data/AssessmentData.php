<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class AssessmentData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public readonly string $title,
        #[Required]
        public readonly int $assessment_type_id,
        #[Required]
        public readonly int $subject_id,
        #[Required]
        public readonly int $school_class_id,
        #[Required]
        public readonly int $academic_term_id,
        #[Min(0), Max(1000)]
        public readonly float $max_score = 100,
        #[Nullable, StringType]
        public readonly ?string $date = null,
        #[Nullable]
        public readonly ?int $teacher_id = null,
    ) {}
}
