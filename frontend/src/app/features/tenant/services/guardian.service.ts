import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Guardian, PaginatedUsersResponse } from '../models/user-management.models';

export interface CreateGuardianPayload {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    relationship?: string;
}

@Injectable({ providedIn: 'root' })
export class GuardianService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/guardians`;

    private readonly _guardians = signal<Guardian[]>([]);
    private readonly _loading = signal(false);
    private readonly _saving = signal(false);
    private readonly _total = signal(0);
    private readonly _currentPage = signal(1);
    private readonly _lastPage = signal(1);

    readonly guardians = this._guardians.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly saving = this._saving.asReadonly();
    readonly total = this._total.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly lastPage = this._lastPage.asReadonly();

    getGuardians(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<Guardian>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    httpParams = httpParams.set(key, String(val));
                }
            });
        }
        return this.http.get<PaginatedUsersResponse<Guardian>>(this.baseUrl, { params: httpParams });
    }

    loadGuardians(params?: Record<string, unknown>): void {
        this._loading.set(true);
        this.getGuardians(params).subscribe({
            next: (res) => {
                this._guardians.set(res.data.data);
                this._total.set(res.data.total);
                this._currentPage.set(res.data.current_page);
                this._lastPage.set(res.data.last_page);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    getGuardian(id: number): Observable<{ data: Guardian }> {
        return this.http.get<{ data: Guardian }>(`${this.baseUrl}/${id}`);
    }

    createGuardian(data: CreateGuardianPayload): Observable<{ data: Guardian }> {
        this._saving.set(true);
        return this.http.post<{ data: Guardian }>(this.baseUrl, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    updateGuardian(id: number, data: Partial<CreateGuardianPayload>): Observable<{ data: Guardian }> {
        this._saving.set(true);
        return this.http.put<{ data: Guardian }>(`${this.baseUrl}/${id}`, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    deleteGuardian(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    linkStudent(guardianId: number, studentId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${guardianId}/link-student`, { student_id: studentId });
    }

    unlinkStudent(guardianId: number, studentId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${guardianId}/unlink-student/${studentId}`);
    }
}
