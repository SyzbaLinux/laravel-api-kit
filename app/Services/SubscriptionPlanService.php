<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\SubscriptionPlanData;
use App\Models\SubscriptionPlan;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class SubscriptionPlanService
{
    /**
     * @return LengthAwarePaginator<int, SubscriptionPlan>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(SubscriptionPlan::class)
            ->allowedFilters([
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'price_monthly', 'price_yearly', 'max_students', 'created_at'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): SubscriptionPlan
    {
        return SubscriptionPlan::query()->findOrFail($id);
    }

    public function create(SubscriptionPlanData $data): SubscriptionPlan
    {
        $slug = Str::slug($data->name);

        $originalSlug = $slug;
        $counter = 1;
        while (SubscriptionPlan::query()->where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return SubscriptionPlan::query()->create([
            'name' => $data->name,
            'slug' => $slug,
            'description' => $data->description,
            'max_students' => $data->max_students,
            'max_teachers' => $data->max_teachers,
            'max_storage_gb' => $data->max_storage_gb,
            'features' => $data->features,
            'price_monthly' => $data->price_monthly,
            'price_yearly' => $data->price_yearly,
            'is_active' => $data->is_active,
        ]);
    }

    public function update(SubscriptionPlan $plan, SubscriptionPlanData $data): SubscriptionPlan
    {
        $updateData = [
            'name' => $data->name,
            'description' => $data->description,
            'max_students' => $data->max_students,
            'max_teachers' => $data->max_teachers,
            'max_storage_gb' => $data->max_storage_gb,
            'features' => $data->features,
            'price_monthly' => $data->price_monthly,
            'price_yearly' => $data->price_yearly,
            'is_active' => $data->is_active,
        ];

        if ($plan->name !== $data->name) {
            $slug = Str::slug($data->name);
            $originalSlug = $slug;
            $counter = 1;
            while (SubscriptionPlan::query()->where('slug', $slug)->where('id', '!=', $plan->id)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }
            $updateData['slug'] = $slug;
        }

        $plan->update($updateData);

        return $plan->refresh();
    }

    public function delete(SubscriptionPlan $plan): bool
    {
        return (bool) $plan->delete();
    }
}
