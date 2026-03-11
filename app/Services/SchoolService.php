<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\SchoolData;
use App\Enums\SchoolStatus;
use App\Models\School;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class SchoolService
{
    /**
     * @return LengthAwarePaginator<int, School>
     */
    public function list(): LengthAwarePaginator
    {
        return QueryBuilder::for(School::class)
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('education_level'),
                AllowedFilter::partial('name'),
                AllowedFilter::exact('country_id'),
                AllowedFilter::exact('state_id'),
                AllowedFilter::exact('city_id'),
                AllowedFilter::exact('subscription_plan_id'),
            ])
            ->allowedSorts(['name', 'created_at', 'status', 'education_level', 'max_students'])
            ->allowedIncludes(['subscriptionPlan', 'users', 'country', 'state', 'city'])
            ->with(['subscriptionPlan', 'country', 'state', 'city'])
            ->paginate(request()->integer('per_page', 15))
            ->withQueryString();
    }

    public function findById(int $id): School
    {
        return School::query()
            ->with(['subscriptionPlan', 'country', 'state', 'city'])
            ->findOrFail($id);
    }

    public function create(SchoolData $data): School
    {
        $slug = Str::slug($data->name);

        $originalSlug = $slug;
        $counter = 1;
        while (School::query()->where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return School::query()->create([
            'name' => $data->name,
            'slug' => $slug,
            'email' => $data->email,
            'phone' => $data->phone,
            'address' => $data->address,
            'city_id' => $data->city_id,
            'state_id' => $data->state_id,
            'country_id' => $data->country_id,
            'logo' => $data->logo,
            'website' => $data->website,
            'education_level' => $data->education_level,
            'status' => $data->status,
            'subscription_plan_id' => $data->subscription_plan_id,
            'max_students' => $data->max_students,
            'max_teachers' => $data->max_teachers,
            'settings' => $data->settings,
            'established_at' => $data->established_at,
        ]);
    }

    public function update(School $school, SchoolData $data): School
    {
        $updateData = [
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
            'address' => $data->address,
            'city_id' => $data->city_id,
            'state_id' => $data->state_id,
            'country_id' => $data->country_id,
            'logo' => $data->logo,
            'website' => $data->website,
            'education_level' => $data->education_level,
            'status' => $data->status,
            'subscription_plan_id' => $data->subscription_plan_id,
            'max_students' => $data->max_students,
            'max_teachers' => $data->max_teachers,
            'settings' => $data->settings,
            'established_at' => $data->established_at,
        ];

        if ($school->name !== $data->name) {
            $slug = Str::slug($data->name);
            $originalSlug = $slug;
            $counter = 1;
            while (School::query()->where('slug', $slug)->where('id', '!=', $school->id)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }
            $updateData['slug'] = $slug;
        }

        $school->update($updateData);

        return $school->refresh();
    }

    public function delete(School $school): bool
    {
        return (bool) $school->delete();
    }

    public function toggleStatus(School $school): School
    {
        $newStatus = $school->status === SchoolStatus::ACTIVE
            ? SchoolStatus::INACTIVE
            : SchoolStatus::ACTIVE;

        $school->update(['status' => $newStatus]);

        return $school->refresh();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, School>
     */
    public function searchPublic(string $search = ''): \Illuminate\Database\Eloquent\Collection
    {
        return School::query()
            ->active()
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->select(['id', 'name', 'slug', 'logo'])
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    /**
     * @return array<string, int>
     */
    public function getStats(School $school): array
    {
        return [
            'total_users' => $school->users()->count(),
            'total_students' => $school->users()->whereHas('role', fn ($q) => $q->where('name', 'student'))->count(),
            'total_teachers' => $school->users()->whereHas('role', fn ($q) => $q->whereIn('name', ['teacher', 'class_teacher']))->count(),
        ];
    }
}
