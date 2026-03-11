import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubscriptionPlan, CreatePlanPayload, PaginatedResponse } from '../models/school.models';

@Injectable({ providedIn: 'root' })
export class PlanService {
    private readonly http = inject(HttpClient);
    private readonly planUrl = `${environment.apiUrl}/admin/subscription-plans`;

    private readonly _plans = signal<SubscriptionPlan[]>([]);
    private readonly _loading = signal(false);

    readonly plans = this._plans.asReadonly();
    readonly loading = this._loading.asReadonly();

    getPlans(): void {
        this._loading.set(true);
        this.http.get<PaginatedResponse<SubscriptionPlan>>(this.planUrl).subscribe({
            next: (res) => {
                this._plans.set(res.data.data);
                this._loading.set(false);
            },
            error: () => this._loading.set(false),
        });
    }

    createPlan(payload: CreatePlanPayload): Observable<{ data: SubscriptionPlan }> {
        this._loading.set(true);
        return this.http.post<{ data: SubscriptionPlan }>(this.planUrl, payload).pipe(
            tap({
                next: (res) => {
                    this._plans.update(list => [res.data, ...list]);
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    updatePlan(id: number, payload: Partial<CreatePlanPayload>): Observable<{ data: SubscriptionPlan }> {
        this._loading.set(true);
        return this.http.put<{ data: SubscriptionPlan }>(`${this.planUrl}/${id}`, payload).pipe(
            tap({
                next: (res) => {
                    this._plans.update(list =>
                        list.map(p => (p.id === id ? res.data : p))
                    );
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }

    deletePlan(id: number): Observable<void> {
        this._loading.set(true);
        return this.http.delete<void>(`${this.planUrl}/${id}`).pipe(
            tap({
                next: () => {
                    this._plans.update(list => list.filter(p => p.id !== id));
                    this._loading.set(false);
                },
                error: () => this._loading.set(false),
            }),
        );
    }
}
