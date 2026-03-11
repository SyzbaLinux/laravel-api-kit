<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\User;
use Spatie\LaravelData\Data;

final class UserData extends Data
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $email,
        public readonly ?string $phone,
        public readonly ?string $avatar,
        public readonly bool $is_active,
        public readonly ?string $role,
        public readonly ?int $school_id,
        public readonly ?string $email_verified_at,
        public readonly ?string $created_at,
        public readonly ?string $updated_at,
    ) {}

    public static function fromModel(User $user): self
    {
        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            phone: $user->phone,
            avatar: $user->avatar,
            is_active: $user->is_active,
            role: $user->role?->name,
            school_id: $user->school_id,
            email_verified_at: $user->email_verified_at?->toIso8601String(),
            created_at: $user->created_at?->toIso8601String(),
            updated_at: $user->updated_at?->toIso8601String(),
        );
    }
}
