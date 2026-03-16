import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Teacher, PaginatedUsersResponse } from '../models/user-management.models';
import { SchoolClass } from '../../../core/models/school-admin.models';

export interface CreateTeacherPayload {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    employee_number?: string;
    qualification?: string;
    specialization?: string;
    join_date?: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/teachers`;

    private readonly _teachers = signal<Teacher[]>([]);
    private readonly _loading = signal(false);
    private readonly _saving = signal(false);
    private readonly _total = signal(0);
    private readonly _currentPage = signal(1);
    private readonly _lastPage = signal(1);

    readonly teachers = this._teachers.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly saving = this._saving.asReadonly();
    readonly total = this._total.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly lastPage = this._lastPage.asReadonly();

    getTeachers(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<Teacher>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    httpParams = httpParams.set(key, String(val));
                }
            });
        }
        return this.http.get<PaginatedUsersResponse<Teacher>>(this.baseUrl, { params: httpParams });
    }

    loadTeachers(params?: Record<string, unknown>): void {
        this._loading.set(true);
        this.getTeachers(params).subscribe({
            next: (res) => {
                this._teachers.set(res.data.data);
                this._total.set(res.data.total);
                this._currentPage.set(res.data.current_page);
                this._lastPage.set(res.data.last_page);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    getTeacher(id: number): Observable<{ data: Teacher }> {
        return this.http.get<{ data: Teacher }>(`${this.baseUrl}/${id}`);
    }

    createTeacher(data: CreateTeacherPayload): Observable<{ data: Teacher }> {
        this._saving.set(true);
        return this.http.post<{ data: Teacher }>(this.baseUrl, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    updateTeacher(id: number, data: Partial<CreateTeacherPayload>): Observable<{ data: Teacher }> {
        this._saving.set(true);
        return this.http.put<{ data: Teacher }>(`${this.baseUrl}/${id}`, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    deleteTeacher(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getTeacherAssignments(teacherId: number): Observable<{ success: boolean; data: SchoolClass[] }> {
        return this.http.get<{ success: boolean; data: SchoolClass[] }>(`${this.baseUrl}/${teacherId}/assignments`);
    }

    assignTeacherToSubjectInClass(classId: number, subjectId: number, teacherId: number): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${environment.apiUrl}/classes/${classId}/assign-subject`,
            { subject_id: subjectId, teacher_id: teacherId },
        );
    }

    importFromCsv(file: File): Observable<{ success: boolean; data: { imported: number; errors: string[] }; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ success: boolean; data: { imported: number; errors: string[] }; message: string }>(
            `${this.baseUrl.replace('/teachers', '')}/teachers/import`,
            formData,
        );
    }
}
