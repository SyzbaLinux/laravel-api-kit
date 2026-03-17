import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GradingScale, GradeRange } from '../../../core/models/school-admin.models';

@Injectable({ providedIn: 'root' })
export class GradingScaleService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getGradingScales(params?: Record<string, unknown>): Observable<{ success: boolean; data: { data: GradingScale[] } }> {
        return this.http.get<{ success: boolean; data: { data: GradingScale[] } }>(`${this.apiUrl}/grading-scales`, {
            params: params as Record<string, string>,
        });
    }

    getGradingScale(id: number): Observable<{ success: boolean; data: GradingScale }> {
        return this.http.get<{ success: boolean; data: GradingScale }>(`${this.apiUrl}/grading-scales/${id}`);
    }

    createGradingScale(data: { name: string; is_default: boolean }): Observable<{ success: boolean; data: GradingScale }> {
        return this.http.post<{ success: boolean; data: GradingScale }>(`${this.apiUrl}/grading-scales`, data);
    }

    updateGradingScale(id: number, data: { name: string; is_default: boolean }): Observable<{ success: boolean; data: GradingScale }> {
        return this.http.put<{ success: boolean; data: GradingScale }>(`${this.apiUrl}/grading-scales/${id}`, data);
    }

    deleteGradingScale(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/grading-scales/${id}`);
    }

    setDefault(id: number): Observable<{ success: boolean; data: GradingScale }> {
        return this.http.post<{ success: boolean; data: GradingScale }>(`${this.apiUrl}/grading-scales/${id}/set-default`, {});
    }

    syncRanges(id: number, ranges: Omit<GradeRange, 'id' | 'grading_scale_id'>[]): Observable<{ success: boolean; data: GradingScale }> {
        return this.http.post<{ success: boolean; data: GradingScale }>(`${this.apiUrl}/grading-scales/${id}/ranges`, { ranges });
    }
}
