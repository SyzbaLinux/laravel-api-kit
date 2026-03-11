<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\SubscriptionPlanData;
use App\Http\Controllers\Api\ApiController;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionPlanService;
use Illuminate\Http\JsonResponse;

final class SubscriptionPlanController extends ApiController
{
    public function __construct(
        private readonly SubscriptionPlanService $subscriptionPlanService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', SubscriptionPlan::class);

        $plans = $this->subscriptionPlanService->list();

        return $this->success($plans, 'Subscription plans retrieved successfully');
    }

    public function store(SubscriptionPlanData $data): JsonResponse
    {
        $this->authorize('create', SubscriptionPlan::class);

        $plan = $this->subscriptionPlanService->create($data);

        return $this->created($plan, 'Subscription plan created successfully');
    }

    public function show(SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        $this->authorize('view', $subscriptionPlan);

        $plan = $this->subscriptionPlanService->findById($subscriptionPlan->id);

        return $this->success($plan, 'Subscription plan retrieved successfully');
    }

    public function update(SubscriptionPlanData $data, SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        $this->authorize('update', $subscriptionPlan);

        $plan = $this->subscriptionPlanService->update($subscriptionPlan, $data);

        return $this->success($plan, 'Subscription plan updated successfully');
    }

    public function destroy(SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        $this->authorize('delete', $subscriptionPlan);

        $this->subscriptionPlanService->delete($subscriptionPlan);

        return $this->success(message: 'Subscription plan deleted successfully');
    }
}
