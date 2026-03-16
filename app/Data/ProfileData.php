<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class ProfileData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Nullable, StringType, Max(20)]
        public readonly ?string $phone = null,
        #[Nullable, StringType, Max(500)]
        public readonly ?string $avatar = null,
    ) {}
}
