import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchoolClass } from '../../../core/models/school-admin.models';
import { PaginatedUsersResponse } from '../models/user-management.models';

@Injectable({ providedIn: 'root' })
export class ClassService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getClasses(params?: Record<string, unknown>): Observable<PaginatedUsersResponse<SchoolClass>> {
        return this.http.get<PaginatedUsersResponse<SchoolClass>>(`${this.apiUrl}/classes`, { params: params as Record<string, string> });
    }

    getClass(id: number): Observable<{ data: SchoolClass }> {
        return this.http.get<{ data: SchoolClass }>(`${this.apiUrl}/classes/${id}`);
    }

    createClass(data: unknown): Observable<{ data: SchoolClass }> {
        return this.http.post<{ data: SchoolClass }>(`${this.apiUrl}/classes`, data);
    }

    updateClass(id: number, data: unknown): Observable<{ data: SchoolClass }> {
        return this.http.put<{ data: SchoolClass }>(`${this.apiUrl}/classes/${id}`, data);
    }

    deleteClass(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/classes/${id}`);
    }

    assignSubject(classId: number, subjectId: number, teacherId?: number): Observable<{ data: SchoolClass }> {
        return this.http.post<{ data: SchoolClass }>(`${this.apiUrl}/classes/${classId}/assign-subject`, {
            subject_id: subjectId,
            teacher_id: teacherId ?? null,
        });
    }

    removeSubject(classId: number, subjectId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/classes/${classId}/remove-subject/${subjectId}`);
    }

    enrollStudent(classId: number, studentId: number): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${this.apiUrl}/classes/${classId}/enroll-student`,
            { student_id: studentId },
        );
    }

    unenrollStudent(classId: number, studentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/classes/${classId}/unenroll-student/${studentId}`);
    }

    assignTeacher(classId: number, teacherId: number): Observable<{ data: SchoolClass }> {
        return this.http.patch<{ data: SchoolClass }>(`${this.apiUrl}/classes/${classId}/assign-teacher`, { teacher_id: teacherId });
    }
}
