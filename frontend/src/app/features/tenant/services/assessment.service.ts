import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Assessment, Mark, MarkEntry } from '../../../core/models/school-admin.models';

export interface AssessmentMarksResponse {
    assessment: Assessment;
    marks: MarkEntry[];
}

@Injectable({ providedIn: 'root' })
export class AssessmentService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getAssessments(params?: Record<string, unknown>): Observable<{ success: boolean; data: { data: Assessment[] } }> {
        return this.http.get<{ success: boolean; data: { data: Assessment[] } }>(`${this.apiUrl}/assessments`, {
            params: params as Record<string, string>,
        });
    }

    getAssessment(id: number): Observable<{ success: boolean; data: Assessment }> {
        return this.http.get<{ success: boolean; data: Assessment }>(`${this.apiUrl}/assessments/${id}`);
    }

    createAssessment(data: Partial<Assessment>): Observable<{ success: boolean; data: Assessment }> {
        return this.http.post<{ success: boolean; data: Assessment }>(`${this.apiUrl}/assessments`, data);
    }

    updateAssessment(id: number, data: Partial<Assessment>): Observable<{ success: boolean; data: Assessment }> {
        return this.http.put<{ success: boolean; data: Assessment }>(`${this.apiUrl}/assessments/${id}`, data);
    }

    deleteAssessment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/assessments/${id}`);
    }

    getMarks(assessmentId: number): Observable<{ success: boolean; data: AssessmentMarksResponse }> {
        return this.http.get<{ success: boolean; data: AssessmentMarksResponse }>(`${this.apiUrl}/assessments/${assessmentId}/marks`);
    }

    bulkSaveMarks(assessmentId: number, marks: Array<{ student_id: number; score: number; comment: string | null }>): Observable<{ success: boolean; data: Mark[] }> {
        return this.http.post<{ success: boolean; data: Mark[] }>(`${this.apiUrl}/assessments/${assessmentId}/marks/bulk`, { marks });
    }
}
