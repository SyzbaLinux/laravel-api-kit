import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Department, User } from '../../../core/models/school-admin.models';
import { PaginatedUsersResponse } from '../models/user-management.models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getDepartments(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<Department>> {
        return this.http.get<PaginatedUsersResponse<Department>>(`${this.apiUrl}/departments`, { params: params as Record<string, string> });
    }

    getDepartment(id: number): Observable<{ data: Department }> {
        return this.http.get<{ data: Department }>(`${this.apiUrl}/departments/${id}`);
    }

    createDepartment(data: unknown): Observable<{ data: Department }> {
        return this.http.post<{ data: Department }>(`${this.apiUrl}/departments`, data);
    }

    updateDepartment(id: number, data: unknown): Observable<{ data: Department }> {
        return this.http.put<{ data: Department }>(`${this.apiUrl}/departments/${id}`, data);
    }

    deleteDepartment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
    }

    assignHod(id: number, hod_id: number | null): Observable<{ data: Department }> {
        return this.http.patch<{ data: Department }>(`${this.apiUrl}/departments/${id}/assign-hod`, { hod_id });
    }

    getTeachers(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<User>> {
        return this.http.get<PaginatedUsersResponse<User>>(`${this.apiUrl}/teachers`, { params: params as Record<string, string> });
    }
}
