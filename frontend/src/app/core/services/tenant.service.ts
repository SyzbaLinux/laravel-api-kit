import { Injectable, signal, computed } from '@angular/core';

export interface TenantContext {
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
    private readonly _currentTenant = signal<TenantContext | null>(this.loadFromStorage());

    readonly currentTenant = this._currentTenant.asReadonly();
    readonly isResolved = computed(() => this._currentTenant() !== null);
    readonly tenantId = computed(() => this._currentTenant()?.schoolId ?? null);
    readonly tenantName = computed(() => this._currentTenant()?.schoolName ?? '');

    setTenant(tenant: TenantContext): void {
        this._currentTenant.set(tenant);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('current_tenant', JSON.stringify(tenant));
        }
    }

    clearTenant(): void {
        this._currentTenant.set(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('current_tenant');
        }
    }

    private loadFromStorage(): TenantContext | null {
        if (typeof localStorage === 'undefined') return null;
        const stored = localStorage.getItem('current_tenant');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
}
