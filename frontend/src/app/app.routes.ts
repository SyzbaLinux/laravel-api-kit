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
            // Teachers
            {
                path: 'teachers',
                loadComponent: () => import('./features/tenant/pages/teachers/teacher-list').then(m => m.TeacherList),
            },
            {
                path: 'teachers/import',
                loadComponent: () => import('./features/tenant/pages/teachers/teacher-import').then(m => m.TeacherImport),
            },
            {
                path: 'teachers/:id',
                loadComponent: () => import('./features/tenant/pages/teachers/teacher-detail').then(m => m.TeacherDetail),
            },
            // Students
            {
                path: 'students',
                loadComponent: () => import('./features/tenant/pages/students/student-list').then(m => m.StudentList),
            },
            {
                path: 'students/import',
                loadComponent: () => import('./features/tenant/pages/students/student-import').then(m => m.StudentImport),
            },
            {
                path: 'students/:id',
                loadComponent: () => import('./features/tenant/pages/students/student-detail').then(m => m.StudentDetail),
            },
            // Guardians
            {
                path: 'guardians',
                loadComponent: () => import('./features/tenant/pages/guardians/guardian-list').then(m => m.GuardianList),
            },
            {
                path: 'guardians/:id',
                loadComponent: () => import('./features/tenant/pages/guardians/guardian-detail').then(m => m.GuardianDetail),
            },
            // School administration
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
                loadComponent: () => import('./features/tenant/pages/timetable/timetable-selector').then(m => m.TimetableSelector),
            },
            {
                path: 'timetable/:classId/:termId',
                loadComponent: () => import('./features/tenant/pages/timetable/timetable-view').then(m => m.TimetableView),
            },
            // Profile
            {
                path: 'profile',
                loadComponent: () => import('./features/tenant/pages/profile/profile-page').then(m => m.ProfilePage),
            },
            // Coming soon pages
            {
                path: 'learning',
                loadComponent: () => import('./shared/components/coming-soon/coming-soon').then(m => m.ComingSoon),
                data: { pageName: 'Learning Management' },
            },
            {
                path: 'communication',
                loadComponent: () => import('./shared/components/coming-soon/coming-soon').then(m => m.ComingSoon),
                data: { pageName: 'Communication' },
            },
            {
                path: 'settings',
                loadComponent: () => import('./shared/components/coming-soon/coming-soon').then(m => m.ComingSoon),
                data: { pageName: 'Settings' },
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
