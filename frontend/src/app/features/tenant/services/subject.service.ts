import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Subject } from '../../../core/models/school-admin.models';
import { PaginatedUsersResponse } from '../models/user-management.models';

@Injectable({ providedIn: 'root' })
export class SubjectService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getSubjects(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<Subject>> {
        return this.http.get<PaginatedUsersResponse<Subject>>(`${this.apiUrl}/subjects`, { params: params as Record<string, string> });
    }

    getSubject(id: number): Observable<{ data: Subject }> {
        return this.http.get<{ data: Subject }>(`${this.apiUrl}/subjects/${id}`);
    }

    createSubject(data: unknown): Observable<{ data: Subject }> {
        return this.http.post<{ data: Subject }>(`${this.apiUrl}/subjects`, data);
    }

    updateSubject(id: number, data: unknown): Observable<{ data: Subject }> {
        return this.http.put<{ data: Subject }>(`${this.apiUrl}/subjects/${id}`, data);
    }

    deleteSubject(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/subjects/${id}`);
    }

    toggleActive(id: number, is_active: boolean): Observable<{ data: Subject }> {
        return this.http.patch<{ data: Subject }>(`${this.apiUrl}/subjects/${id}`, { is_active });
    }
}
