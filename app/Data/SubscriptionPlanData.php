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

final class SubscriptionPlanData extends Data
{
    public function __construct(
        public readonly int|Optional $id,
        #[Required, StringType, Max(255)]
        public readonly string $name,
        public readonly string|Optional $slug,
        #[Nullable, StringType]
        public readonly ?string $description = null,
        #[Required, Min(1)]
        public readonly int $max_students = 100,
        #[Required, Min(1)]
        public readonly int $max_teachers = 10,
        #[Min(1)]
        public readonly int $max_storage_gb = 5,
        /** @var array<int, string>|null */
        public readonly ?array $features = null,
        #[Required, Min(0)]
        public readonly float $price_monthly = 0.00,
        #[Required, Min(0)]
        public readonly float $price_yearly = 0.00,
        public readonly bool $is_active = true,
    ) {}
}
