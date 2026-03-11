import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, AuthResponse } from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly tokenService = inject(TokenService);
    private readonly apiUrl = environment.apiUrl;

    readonly currentUser = signal<AuthUser | null>(this.tokenService.getUser());

    /** URL to redirect to after login (set by authGuard or errorInterceptor) */
    redirectUrl: string | null = null;

    readonly isAuthenticated = computed(() => !!this.currentUser());
    readonly userRole = computed(() => this.currentUser()?.role?.name ?? null);
    readonly isSuperAdmin = computed(() => this.currentUser()?.role?.name === 'super_admin');
    readonly isSchoolAdmin = computed(() => this.currentUser()?.role?.name === 'school_admin');

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap((res) => {
                    this.tokenService.setToken(res.data.token);
                    this.tokenService.setUser(res.data.user);
                    this.currentUser.set(res.data.user);
                }),
            );
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
            tap(() => {
                this.tokenService.clearToken();
                this.tokenService.clearUser();
                this.currentUser.set(null);
            }),
        );
    }

    me(): Observable<{ data: AuthUser }> {
        return this.http.get<{ data: AuthUser }>(`${this.apiUrl}/me`).pipe(
            tap((res) => {
                this.tokenService.setUser(res.data);
                this.currentUser.set(res.data);
            }),
        );
    }

    forgotPassword(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/forgot-password`,
            { email },
        );
    }

    resetPassword(
        token: string,
        email: string,
        password: string,
        password_confirmation: string,
    ): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/reset-password`,
            { token, email, password, password_confirmation },
        );
    }

    clearSession(): void {
        this.tokenService.clearToken();
        this.tokenService.clearUser();
        this.currentUser.set(null);
    }
}
