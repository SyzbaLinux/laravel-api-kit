<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;

final class BulkMarkData extends Data
{
    public function __construct(
        public readonly int $assessment_id,
        #[DataCollectionOf(MarkData::class)]
        public readonly DataCollection $marks,
    ) {}
}
