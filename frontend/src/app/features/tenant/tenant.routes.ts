import { Routes } from '@angular/router';

export const TENANT_ROUTES: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/tenant-dashboard').then(m => m.TenantDashboard),
    },
    {
        path: 'departments',
        loadComponent: () => import('./pages/departments/department-list').then(m => m.DepartmentList),
    },
    {
        path: 'subjects',
        loadComponent: () => import('./pages/subjects/subject-list').then(m => m.SubjectList),
    },
    {
        path: 'classes',
        loadComponent: () => import('./pages/classes/class-list').then(m => m.ClassList),
    },
    {
        path: 'classes/:id',
        loadComponent: () => import('./pages/classes/class-detail').then(m => m.ClassDetail),
    },
    {
        path: 'academic-years',
        loadComponent: () => import('./pages/academic-years/academic-year-list').then(m => m.AcademicYearList),
    },
    {
        path: 'timetable',
        loadComponent: () => import('./pages/timetable/timetable-view').then(m => m.TimetableView),
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
];
