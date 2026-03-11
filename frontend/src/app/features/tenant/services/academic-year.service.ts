import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AcademicYear, AcademicTerm, PaginatedResponse } from '../../../core/models/school-admin.models';

@Injectable({ providedIn: 'root' })
export class AcademicYearService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getAcademicYears(params?: Record<string, unknown>): Observable<PaginatedResponse<AcademicYear>> {
        return this.http.get<PaginatedResponse<AcademicYear>>(`${this.apiUrl}/academic-years`, { params: params as Record<string, string> });
    }

    getAcademicYear(id: number): Observable<{ data: AcademicYear }> {
        return this.http.get<{ data: AcademicYear }>(`${this.apiUrl}/academic-years/${id}`);
    }

    createAcademicYear(data: unknown): Observable<{ data: AcademicYear }> {
        return this.http.post<{ data: AcademicYear }>(`${this.apiUrl}/academic-years`, data);
    }

    updateAcademicYear(id: number, data: unknown): Observable<{ data: AcademicYear }> {
        return this.http.put<{ data: AcademicYear }>(`${this.apiUrl}/academic-years/${id}`, data);
    }

    deleteAcademicYear(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/academic-years/${id}`);
    }

    setCurrent(id: number): Observable<{ data: AcademicYear }> {
        return this.http.patch<{ data: AcademicYear }>(`${this.apiUrl}/academic-years/${id}/set-current`, {});
    }

    getTerms(yearId: number): Observable<{ data: AcademicTerm[] }> {
        return this.http.get<{ data: AcademicTerm[] }>(`${this.apiUrl}/academic-years/${yearId}/terms`);
    }

    createTerm(yearId: number, data: unknown): Observable<{ data: AcademicTerm }> {
        return this.http.post<{ data: AcademicTerm }>(`${this.apiUrl}/academic-years/${yearId}/terms`, data);
    }

    updateTerm(termId: number, data: unknown): Observable<{ data: AcademicTerm }> {
        return this.http.put<{ data: AcademicTerm }>(`${this.apiUrl}/terms/${termId}`, data);
    }

    deleteTerm(termId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/terms/${termId}`);
    }

    setCurrentTerm(termId: number): Observable<{ data: AcademicTerm }> {
        return this.http.patch<{ data: AcademicTerm }>(`${this.apiUrl}/terms/${termId}/set-current`, {});
    }
}
