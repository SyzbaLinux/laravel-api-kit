import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchoolUser, SchoolRole, CreateSchoolUserPayload, PaginatedResponse } from '../models/school.models';

@Injectable({ providedIn: 'root' })
export class SchoolUserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/admin`;

    private readonly _users = signal<SchoolUser[]>([]);
    private readonly _roles = signal<SchoolRole[]>([]);
    private readonly _loading = signal(false);
    private readonly _saving = signal(false);

    readonly users = this._users.asReadonly();
    readonly roles = this._roles.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly saving = this._saving.asReadonly();

    loadUsers(schoolId: string): void {
        this._loading.set(true);
        this.http.get<PaginatedResponse<SchoolUser>>(`${this.baseUrl}/schools/${schoolId}/users`).subscribe({
            next: (res) => {
                this._users.set(res.data.data);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    loadRoles(): void {
        if (this._roles().length > 0) return;
        this.http.get<{ data: SchoolRole[] }>(`${this.baseUrl}/school-roles`).subscribe({
            next: (res) => this._roles.set(res.data),
        });
    }

    createUser(schoolId: string, payload: CreateSchoolUserPayload): Observable<{ data: SchoolUser }> {
        this._saving.set(true);
        return this.http.post<{ data: SchoolUser }>(`${this.baseUrl}/schools/${schoolId}/users`, payload).pipe(
            tap({
                next: (res) => {
                    this._users.update(list => [res.data, ...list]);
                    this._saving.set(false);
                },
                error: () => this._saving.set(false),
            }),
        );
    }

    deleteUser(schoolId: string, userId: number): Observable<void> {
        this._saving.set(true);
        return this.http.delete<void>(`${this.baseUrl}/schools/${schoolId}/users/${userId}`).pipe(
            tap({
                next: () => {
                    this._users.update(list => list.filter(u => u.id !== userId));
                    this._saving.set(false);
                },
                error: () => this._saving.set(false),
            }),
        );
    }

    clearUsers(): void {
        this._users.set([]);
    }
}
