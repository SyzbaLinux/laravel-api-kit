<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\JsonResponse;

final class LocationController extends ApiController
{
    public function countries(): JsonResponse
    {
        $countries = Country::query()
            ->select(['id', 'name', 'iso'])
            ->orderBy('name')
            ->get();

        return $this->success($countries, 'Countries retrieved successfully');
    }

    public function states(Country $country): JsonResponse
    {
        $states = $country->states()
            ->select(['id', 'name', 'country_id'])
            ->orderBy('name')
            ->get();

        return $this->success($states, 'States retrieved successfully');
    }

    public function cities(State $state): JsonResponse
    {
        $cities = $state->cities()
            ->select(['id', 'name', 'state_id'])
            ->orderBy('name')
            ->get();

        return $this->success($cities, 'Cities retrieved successfully');
    }
}
