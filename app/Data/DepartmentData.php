<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class DepartmentData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Nullable, StringType]
        public readonly ?string $description,
        public readonly ?int $hod_id = null,
    ) {}
}
