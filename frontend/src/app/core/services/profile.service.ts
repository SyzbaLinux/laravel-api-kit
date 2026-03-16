import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/auth.models';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    avatar?: string | null;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly tokenService = inject(TokenService);
    private readonly apiUrl = environment.apiUrl;

    getProfile(): Observable<{ data: AuthUser }> {
        return this.http.get<{ data: AuthUser }>(`${this.apiUrl}/profile`);
    }

    updateProfile(data: UpdateProfilePayload): Observable<{ data: AuthUser }> {
        return this.http.put<{ data: AuthUser }>(`${this.apiUrl}/profile`, data).pipe(
            tap((res) => {
                this.tokenService.setUser(res.data);
                this.authService.currentUser.set(res.data);
            }),
        );
    }

    changePassword(data: ChangePasswordPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/profile/change-password`, data);
    }
}
