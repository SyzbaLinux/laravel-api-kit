import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AssessmentType } from '../../../core/models/school-admin.models';

@Injectable({ providedIn: 'root' })
export class AssessmentTypeService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getAssessmentTypes(params?: Record<string, unknown>): Observable<{ success: boolean; data: { data: AssessmentType[] } }> {
        return this.http.get<{ success: boolean; data: { data: AssessmentType[] } }>(`${this.apiUrl}/assessment-types`, {
            params: params as Record<string, string>,
        });
    }

    createAssessmentType(data: Partial<AssessmentType>): Observable<{ success: boolean; data: AssessmentType }> {
        return this.http.post<{ success: boolean; data: AssessmentType }>(`${this.apiUrl}/assessment-types`, data);
    }

    updateAssessmentType(id: number, data: Partial<AssessmentType>): Observable<{ success: boolean; data: AssessmentType }> {
        return this.http.put<{ success: boolean; data: AssessmentType }>(`${this.apiUrl}/assessment-types/${id}`, data);
    }

    deleteAssessmentType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/assessment-types/${id}`);
    }
}
