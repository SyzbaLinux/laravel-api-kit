import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    School,
    SchoolStatus,
    CreateSchoolPayload,
    UpdateSchoolPayload,
    SubscriptionPlan,
    CreatePlanPayload,
    PlatformStats,
    PaginatedResponse,
} from '../models/school.models';

export interface SchoolFilters {
    search: string;
    status: SchoolStatus | '';
    planId: string;
    page: number;
    perPage: number;
}

@Injectable({ providedIn: 'root' })
export class SchoolService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/admin/schools`;
    private readonly planUrl = `${environment.apiUrl}/admin/subscription-plans`;
    private readonly statsUrl = `${environment.apiUrl}/admin/platform/stats`;

    // ─── Schools State ──────────────────────────────────────────────────
    private readonly _schools = signal<School[]>([]);
    private readonly _loading = signal(false);
    private readonly _totalSchools = signal(0);
    private readonly _currentPage = signal(1);
    private readonly _lastPage = signal(1);
    private readonly _selectedSchool = signal<School | null>(null);

    readonly schools = this._schools.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly totalSchools = this._totalSchools.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly lastPage = this._lastPage.asReadonly();
    readonly selectedSchool = this._selectedSchool.asReadonly();

    // ─── Plans State ────────────────────────────────────────────────────
    private readonly _plans = signal<SubscriptionPlan[]>([]);
    private readonly _plansLoading = signal(false);

    readonly plans = this._plans.asReadonly();
    readonly plansLoading = this._plansLoading.asReadonly();

    // ─── Platform Stats ────────────────────────────────────────────────
    private readonly _stats = signal<PlatformStats | null>(null);
    private readonly _statsLoading = signal(false);

    readonly stats = this._stats.asReadonly();
    readonly statsLoading = this._statsLoading.asReadonly();

    // ─── Computed ──────────────────────────────────────────────────────
    readonly activeSchoolsCount = computed(() =>
        this._schools().filter(s => s.status === 'active').length
    );

    // ─── School CRUD ──────────────────────────────────────────────────
    loadSchools(filters: Partial<SchoolFilters> = {}): void {
        this._loading.set(true);
        let params = new HttpParams();
        if (filters.search) params = params.set('filter[name]', filters.search);
        if (filters.status) params = params.set('filter[status]', filters.status);
        if (filters.planId) params = params.set('filter[subscription_plan_id]', filters.planId);
        params = params.set('page', String(filters.page ?? 1));
        params = params.set('per_page', String(filters.perPage ?? 15));

        this.http.get<PaginatedResponse<School>>(this.baseUrl, { params }).subscribe({
            next: (res) => {
                this._schools.set(res.data.data);
                this._totalSchools.set(res.data.total);
                this._currentPage.set(res.data.current_page);
                this._lastPage.set(res.data.last_page);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    loadSchool(id: string): void {
        this._loading.set(true);
        this.http.get<{ data: School }>(`${this.baseUrl}/${id}`).subscribe({
            next: (res) => {
                this._selectedSchool.set(res.data);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    createSchool(payload: CreateSchoolPayload): Observable<{ data: School }> {
        this._loading.set(true);
        return this.http.post<{ data: School }>(this.baseUrl, payload).pipe(
            tap({
                next: (res) => {
                    this._schools.update(list => [res.data, ...list]);
                    this._totalSchools.update(n => n + 1);
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    updateSchool(id: string, payload: UpdateSchoolPayload): Observable<{ data: School }> {
        this._loading.set(true);
        return this.http.put<{ data: School }>(`${this.baseUrl}/${id}`, payload).pipe(
            tap({
                next: (res) => {
                    this._schools.update(list =>
                        list.map(s => (s.id === id ? res.data : s))
                    );
                    if (this._selectedSchool()?.id === id) {
                        this._selectedSchool.set(res.data);
                    }
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    deleteSchool(id: string): Observable<void> {
        this._loading.set(true);
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
            tap({
                next: () => {
                    this._schools.update(list => list.filter(s => s.id !== id));
                    this._totalSchools.update(n => n - 1);
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    toggleStatus(id: string, status: SchoolStatus): Observable<{ data: School }> {
        this._loading.set(true);
        return this.http.patch<{ data: School }>(`${this.baseUrl}/${id}/toggle-status`, { status }).pipe(
            tap({
                next: (res) => {
                    this._schools.update(list =>
                        list.map(s => (s.id === id ? res.data : s))
                    );
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    // ─── Subscription Plans ───────────────────────────────────────────
    loadPlans(): void {
        this._plansLoading.set(true);
        this.http.get<PaginatedResponse<SubscriptionPlan>>(this.planUrl).subscribe({
            next: (res) => {
                this._plans.set(res.data.data);
                this._plansLoading.set(false);
            },
            error: () => this._plansLoading.set(false),
        });
    }

    createPlan(payload: CreatePlanPayload): Observable<{ data: SubscriptionPlan }> {
        this._plansLoading.set(true);
        return this.http.post<{ data: SubscriptionPlan }>(this.planUrl, payload).pipe(
            tap({
                next: (res) => {
                    this._plans.update(list => [res.data, ...list]);
                    this._plansLoading.set(false);
                },
                error: () => this._plansLoading.set(false),
            }),
        );
    }

    updatePlan(id: number, payload: Partial<CreatePlanPayload>): Observable<{ data: SubscriptionPlan }> {
        this._plansLoading.set(true);
        return this.http.put<{ data: SubscriptionPlan }>(`${this.planUrl}/${id}`, payload).pipe(
            tap({
                next: (res) => {
                    this._plans.update(list =>
                        list.map(p => (p.id === id ? res.data : p))
                    );
                    this._plansLoading.set(false);
                },
                error: () => this._plansLoading.set(false),
            }),
        );
    }

    deletePlan(id: number): Observable<void> {
        this._plansLoading.set(true);
        return this.http.delete<void>(`${this.planUrl}/${id}`).pipe(
            tap({
                next: () => {
                    this._plans.update(list => list.filter(p => p.id !== id));
                    this._plansLoading.set(false);
                },
                error: () => this._plansLoading.set(false),
            }),
        );
    }

    // ─── Platform Stats ───────────────────────────────────────────────
    loadStats(): void {
        this._statsLoading.set(true);
        this.http.get<{ data: PlatformStats }>(this.statsUrl).subscribe({
            next: (res) => {
                this._stats.set(res.data);
                this._statsLoading.set(false);
            },
            error: () => this._statsLoading.set(false),
        });
    }
}
