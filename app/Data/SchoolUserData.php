<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class SchoolUserData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Required, Email, Max(255)]
        public readonly string $email,
        #[Required, StringType, Min(8)]
        public readonly string $password,
        #[Nullable, StringType, Max(20)]
        public readonly ?string $phone = null,
        /** @var array<int, int> */
        #[Required]
        public readonly array $role_ids = [],
    ) {}
}
