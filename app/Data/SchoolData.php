<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class SchoolData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(255)]
        public readonly string $name,
        public readonly string|Optional $slug,
        #[Required, Email, Max(255)]
        public readonly string $email,
        #[Nullable, StringType, Max(20)]
        public readonly ?string $phone,
        #[Nullable, StringType, Max(500)]
        public readonly ?string $address,
        #[Nullable]
        public readonly ?int $city_id = null,
        #[Nullable]
        public readonly ?int $state_id = null,
        #[Nullable]
        public readonly ?int $country_id = null,
        #[Nullable, StringType]
        public readonly ?string $logo = null,
        #[Nullable, Url]
        public readonly ?string $website = null,
        #[Required, In('ecd', 'primary', 'secondary', 'combined')]
        public readonly string $education_level = 'combined',
        #[In('active', 'inactive', 'suspended')]
        public readonly string $status = 'active',
        public readonly ?int $subscription_plan_id = null,
        #[Min(1)]
        public readonly int $max_students = 500,
        #[Min(1)]
        public readonly int $max_teachers = 50,
        /** @var array<string, mixed>|null */
        public readonly ?array $settings = null,
        public readonly ?string $established_at = null,
    ) {}
}
