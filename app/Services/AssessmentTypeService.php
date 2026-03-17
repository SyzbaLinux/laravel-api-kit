<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\AssessmentTypeData;
use App\Models\AssessmentType;
use Illuminate\Pagination\LengthAwarePaginator;

final class AssessmentTypeService
{
    /**
     * @return LengthAwarePaginator<int, AssessmentType>
     */
    public function list(): LengthAwarePaginator
    {
        return AssessmentType::query()
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(request()->integer('per_page', 50))
            ->withQueryString();
    }

    public function create(AssessmentTypeData $data): AssessmentType
    {
        return AssessmentType::query()->create([
            'name'      => $data->name,
            'category'  => $data->category->value,
            'weight'    => $data->weight,
            'is_active' => $data->is_active,
        ]);
    }

    public function update(AssessmentType $type, AssessmentTypeData $data): AssessmentType
    {
        $type->update([
            'name'      => $data->name,
            'category'  => $data->category->value,
            'weight'    => $data->weight,
            'is_active' => $data->is_active,
        ]);

        return $type->refresh();
    }

    public function delete(AssessmentType $type): bool
    {
        return (bool) $type->delete();
    }
}
