<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\ProfileData;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

final class ProfileController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return $this->success(new UserResource($user), 'Profile retrieved successfully');
    }

    public function update(ProfileData $data, Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'name' => $data->name,
            'phone' => $data->phone,
            'avatar' => $data->avatar,
        ]);

        $user->load('role');

        return $this->success(new UserResource($user), 'Profile updated successfully');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return $this->unauthorized('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return $this->success(message: 'Password changed successfully');
    }
}
