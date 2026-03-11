import { Routes } from '@angular/router';
import { SuperAdminLayout } from './layouts/super-admin-layout';

export const SUPER_ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: SuperAdminLayout,
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./pages/dashboard/super-admin-dashboard').then(m => m.SuperAdminDashboard),
            },
            {
                path: 'schools',
                loadComponent: () =>
                    import('./pages/schools/school-list').then(m => m.SchoolListPage),
            },
            {
                path: 'schools/create',
                loadComponent: () =>
                    import('./pages/schools/school-form').then(m => m.SchoolFormPage),
            },
            {
                path: 'schools/:id',
                loadComponent: () =>
                    import('./pages/schools/school-detail').then(m => m.SchoolDetailPage),
            },
            {
                path: 'schools/:id/edit',
                loadComponent: () =>
                    import('./pages/schools/school-form').then(m => m.SchoolFormPage),
            },
            {
                path: 'plans',
                loadComponent: () =>
                    import('./pages/plans/plan-management').then(m => m.PlanManagementPage),
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
        ],
    },
];
