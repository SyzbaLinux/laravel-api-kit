import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Student, PaginatedUsersResponse } from '../models/user-management.models';

export interface CreateStudentPayload {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    student_number?: string;
    date_of_birth?: string;
    gender?: string;
    admission_date?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/students`;

    private readonly _students = signal<Student[]>([]);
    private readonly _loading = signal(false);
    private readonly _saving = signal(false);
    private readonly _total = signal(0);
    private readonly _currentPage = signal(1);
    private readonly _lastPage = signal(1);

    readonly students = this._students.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly saving = this._saving.asReadonly();
    readonly total = this._total.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly lastPage = this._lastPage.asReadonly();

    getStudents(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<Student>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    httpParams = httpParams.set(key, String(val));
                }
            });
        }
        return this.http.get<PaginatedUsersResponse<Student>>(this.baseUrl, { params: httpParams });
    }

    loadStudents(params?: Record<string, unknown>): void {
        this._loading.set(true);
        this.getStudents(params).subscribe({
            next: (res) => {
                this._students.set(res.data.data);
                this._total.set(res.data.total);
                this._currentPage.set(res.data.current_page);
                this._lastPage.set(res.data.last_page);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    getStudent(id: number): Observable<{ data: Student }> {
        return this.http.get<{ data: Student }>(`${this.baseUrl}/${id}`);
    }

    createStudent(data: CreateStudentPayload): Observable<{ data: Student }> {
        this._saving.set(true);
        return this.http.post<{ data: Student }>(this.baseUrl, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    updateStudent(id: number, data: Partial<CreateStudentPayload>): Observable<{ data: Student }> {
        this._saving.set(true);
        return this.http.put<{ data: Student }>(`${this.baseUrl}/${id}`, data).pipe(
            tap({
                next: () => this._saving.set(false),
                error: () => this._saving.set(false),
            }),
        );
    }

    deleteStudent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    enrollStudent(studentId: number, classId: number, academicYearId?: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${studentId}/enroll`, {
            class_id: classId,
            academic_year_id: academicYearId ?? null,
        });
    }
}
