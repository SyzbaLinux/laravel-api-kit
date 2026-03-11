<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class SubjectData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Required, StringType, Max(50)]
        public readonly string $code,
        #[Nullable, StringType]
        public readonly ?string $description,
        public readonly ?int $department_id,
        #[Required, In('ecd', 'primary', 'secondary', 'all')]
        public readonly string $education_level,
        public readonly bool $is_active = true,
    ) {}
}
