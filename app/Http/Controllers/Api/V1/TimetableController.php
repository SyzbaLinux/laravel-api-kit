<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Data\TimetableData;
use App\Http\Controllers\Api\ApiController;
use App\Models\Timetable;
use App\Services\TimetableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TimetableController extends ApiController
{
    public function __construct(
        private readonly TimetableService $timetableService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Timetable::class);

        $classId = $request->integer('class_id');
        $timetables = $this->timetableService->list($classId);

        return $this->success($timetables, 'Timetables retrieved successfully');
    }

    public function store(TimetableData $data): JsonResponse
    {
        $this->authorize('create', Timetable::class);

        $conflicts = $this->timetableService->checkConflicts($data);

        if ($conflicts !== []) {
            return $this->error('Scheduling conflicts detected', 422, ['conflicts' => $conflicts]);
        }

        $timetable = $this->timetableService->create($data);

        return $this->created($timetable, 'Timetable entry created successfully');
    }

    public function show(Timetable $timetable): JsonResponse
    {
        $this->authorize('view', $timetable);

        $timetable = $this->timetableService->findById($timetable->id);

        return $this->success($timetable, 'Timetable entry retrieved successfully');
    }

    public function update(TimetableData $data, Timetable $timetable): JsonResponse
    {
        $this->authorize('update', $timetable);

        $conflicts = $this->timetableService->checkConflicts($data, $timetable->id);

        if ($conflicts !== []) {
            return $this->error('Scheduling conflicts detected', 422, ['conflicts' => $conflicts]);
        }

        $timetable = $this->timetableService->update($timetable, $data);

        return $this->success($timetable, 'Timetable entry updated successfully');
    }

    public function destroy(Timetable $timetable): JsonResponse
    {
        $this->authorize('delete', $timetable);

        $this->timetableService->delete($timetable);

        return $this->success(message: 'Timetable entry deleted successfully');
    }

    public function checkConflicts(TimetableData $data): JsonResponse
    {
        $this->authorize('create', Timetable::class);

        $excludeId = request()->integer('exclude_id') ?: null;
        $conflicts = $this->timetableService->checkConflicts($data, $excludeId);

        return $this->success([
            'has_conflicts' => $conflicts !== [],
            'conflicts' => $conflicts,
        ], 'Conflict check completed');
    }
}
