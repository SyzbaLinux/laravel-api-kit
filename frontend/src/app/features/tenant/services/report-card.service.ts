import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReportCardSummary, ReportCardDetail, SubjectResult } from '../../../core/models/school-admin.models';

@Injectable({ providedIn: 'root' })
export class ReportCardService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    calculateResults(classId: number, termId: number): Observable<{ success: boolean; data: SubjectResult[] }> {
        return this.http.post<{ success: boolean; data: SubjectResult[] }>(`${this.apiUrl}/classes/${classId}/calculate-results`, { term_id: termId });
    }

    getClassReportCards(classId: number, termId: number): Observable<{ success: boolean; data: ReportCardSummary[] }> {
        return this.http.get<{ success: boolean; data: ReportCardSummary[] }>(`${this.apiUrl}/classes/${classId}/report-cards`, {
            params: { term_id: String(termId) },
        });
    }

    getReportCard(id: number): Observable<{ success: boolean; data: ReportCardDetail }> {
        return this.http.get<{ success: boolean; data: ReportCardDetail }>(`${this.apiUrl}/report-cards/${id}`);
    }

    approve(id: number): Observable<{ success: boolean; data: ReportCardSummary }> {
        return this.http.post<{ success: boolean; data: ReportCardSummary }>(`${this.apiUrl}/report-cards/${id}/approve`, {});
    }

    publish(id: number): Observable<{ success: boolean; data: ReportCardSummary }> {
        return this.http.post<{ success: boolean; data: ReportCardSummary }>(`${this.apiUrl}/report-cards/${id}/publish`, {});
    }

    unpublish(id: number): Observable<{ success: boolean; data: ReportCardSummary }> {
        return this.http.post<{ success: boolean; data: ReportCardSummary }>(`${this.apiUrl}/report-cards/${id}/unpublish`, {});
    }

    updateClassTeacherComment(id: number, comment: string, promotionStatus: string | null): Observable<{ success: boolean; data: ReportCardSummary }> {
        return this.http.patch<{ success: boolean; data: ReportCardSummary }>(`${this.apiUrl}/report-cards/${id}/class-teacher-comment`, {
            comment,
            promotion_status: promotionStatus,
        });
    }

    updateSubjectComment(subjectResultId: number, comment: string): Observable<{ success: boolean; data: SubjectResult }> {
        return this.http.patch<{ success: boolean; data: SubjectResult }>(`${this.apiUrl}/subject-results/${subjectResultId}/comment`, { comment });
    }
}
