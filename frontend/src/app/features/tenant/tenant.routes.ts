import { Routes } from '@angular/router';

export const TENANT_ROUTES: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/tenant-dashboard').then(m => m.TenantDashboard),
    },
    {
        path: 'teachers',
        loadComponent: () => import('./pages/teachers/teacher-list').then(m => m.TeacherList),
    },
    {
        path: 'teachers/import',
        loadComponent: () => import('./pages/teachers/teacher-import').then(m => m.TeacherImport),
    },
    {
        path: 'teachers/:id',
        loadComponent: () => import('./pages/teachers/teacher-detail').then(m => m.TeacherDetail),
    },
    {
        path: 'students',
        loadComponent: () => import('./pages/students/student-list').then(m => m.StudentList),
    },
    {
        path: 'students/import',
        loadComponent: () => import('./pages/students/student-import').then(m => m.StudentImport),
    },
    {
        path: 'students/:id',
        loadComponent: () => import('./pages/students/student-detail').then(m => m.StudentDetail),
    },
    {
        path: 'guardians',
        loadComponent: () => import('./pages/guardians/guardian-list').then(m => m.GuardianList),
    },
    {
        path: 'guardians/:id',
        loadComponent: () => import('./pages/guardians/guardian-detail').then(m => m.GuardianDetail),
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
        loadComponent: () => import('./pages/timetable/timetable-selector').then(m => m.TimetableSelector),
    },
    {
        path: 'timetable/:classId/:termId',
        loadComponent: () => import('./pages/timetable/timetable-view').then(m => m.TimetableView),
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile-page').then(m => m.ProfilePage),
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
];
