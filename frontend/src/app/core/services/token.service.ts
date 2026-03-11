import { Injectable } from '@angular/core';
import { AuthUser } from '../models/auth.models';

const TOKEN_KEY = 'omni_auth_token';
const USER_KEY = 'omni_auth_user';

@Injectable({ providedIn: 'root' })
export class TokenService {
    getToken(): string | null {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    }

    setToken(token: string): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
    }

    clearToken(): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
    }

    getUser(): AuthUser | null {
        if (typeof localStorage === 'undefined') return null;
        const stored = localStorage.getItem(USER_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored) as AuthUser;
        } catch {
            return null;
        }
    }

    setUser(user: AuthUser): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    clearUser(): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(USER_KEY);
    }
}
