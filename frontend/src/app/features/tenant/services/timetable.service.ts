import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Timetable, PaginatedResponse } from '../../../core/models/school-admin.models';

export interface ConflictCheckResult {
    has_conflicts: boolean;
    conflicts: Array<{
        type: string;
        message: string;
        conflicting_entry?: Timetable;
    }>;
}

@Injectable({ providedIn: 'root' })
export class TimetableService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getTimetables(params?: Record<string, unknown>): Observable<PaginatedResponse<Timetable>> {
        return this.http.get<PaginatedResponse<Timetable>>(`${this.apiUrl}/timetables`, { params: params as Record<string, string> });
    }

    getTimetable(id: number): Observable<{ data: Timetable }> {
        return this.http.get<{ data: Timetable }>(`${this.apiUrl}/timetables/${id}`);
    }

    createTimetable(data: unknown): Observable<{ data: Timetable }> {
        return this.http.post<{ data: Timetable }>(`${this.apiUrl}/timetables`, data);
    }

    updateTimetable(id: number, data: unknown): Observable<{ data: Timetable }> {
        return this.http.put<{ data: Timetable }>(`${this.apiUrl}/timetables/${id}`, data);
    }

    deleteTimetable(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/timetables/${id}`);
    }

    checkConflicts(data: unknown): Observable<ConflictCheckResult> {
        return this.http.post<ConflictCheckResult>(`${this.apiUrl}/timetables/check-conflicts`, data);
    }
}
