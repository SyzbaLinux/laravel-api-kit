import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                const currentUrl = router.url;
                authService.clearSession();
                authService.redirectUrl = currentUrl && currentUrl !== '/auth/login' ? currentUrl : null;
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        }),
    );
};
