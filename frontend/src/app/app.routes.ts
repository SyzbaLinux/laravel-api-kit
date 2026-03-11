import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing').then(m => m.LandingPage),
    },
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login').then(m => m.LoginPage),
    },
    {
        path: 'auth/forgot-password',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordPage),
    },
    {
        path: 'auth/institutions',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/institution-login').then(m => m.InstitutionLoginPage),
    },
    {
        path: 'auth/register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register').then(m => m.RegisterPage),
    },
    {
        path: 'super-admin',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['super_admin'] },
        loadChildren: () =>
            import('./features/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES),
    },
    {
        path: 'tenant',
        canActivate: [authGuard],
        loadComponent: () => import('./features/tenant/layouts/tenant-layout').then(m => m.TenantLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/tenant/pages/dashboard/tenant-dashboard').then(m => m.TenantDashboard),
            },
            {
                path: 'departments',
                loadComponent: () => import('./features/tenant/pages/departments/department-list').then(m => m.DepartmentList),
            },
            {
                path: 'subjects',
                loadComponent: () => import('./features/tenant/pages/subjects/subject-list').then(m => m.SubjectList),
            },
            {
                path: 'classes',
                loadComponent: () => import('./features/tenant/pages/classes/class-list').then(m => m.ClassList),
            },
            {
                path: 'classes/:id',
                loadComponent: () => import('./features/tenant/pages/classes/class-detail').then(m => m.ClassDetail),
            },
            {
                path: 'academic-years',
                loadComponent: () => import('./features/tenant/pages/academic-years/academic-year-list').then(m => m.AcademicYearList),
            },
            {
                path: 'timetable',
                loadComponent: () => import('./features/tenant/pages/timetable/timetable-view').then(m => m.TimetableView),
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
