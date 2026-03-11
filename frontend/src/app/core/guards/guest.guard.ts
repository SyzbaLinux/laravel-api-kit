import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    const redirectUrl = authService.redirectUrl;
    if (redirectUrl) {
        authService.redirectUrl = null;
        return router.parseUrl(redirectUrl);
    }

    const role = authService.userRole();
    return router.createUrlTree([role === 'super_admin' ? '/super-admin/dashboard' : '/tenant/dashboard']);
};
