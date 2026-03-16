<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class TeacherData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public readonly string $name,
        #[Required, Email, Max(255)]
        public readonly string $email,
        #[Nullable, StringType, Min(8)]
        public readonly ?string $password = null,
        #[Nullable, StringType, Max(20)]
        public readonly ?string $phone = null,
        #[Nullable, StringType, Max(50)]
        public readonly ?string $employee_number = null,
        #[Nullable, StringType, Max(255)]
        public readonly ?string $qualification = null,
        #[Nullable, StringType, Max(255)]
        public readonly ?string $specialization = null,
        #[Nullable, Date]
        public readonly ?string $join_date = null,
    ) {}
}
