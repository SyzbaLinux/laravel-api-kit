# Multi-Tenant School Management & Learning System — Task Overview

## System Summary

A multi-tenant School Management System (SMS) supporting Infant (ECD), Primary, and Secondary education within a unified platform. Combines three major components:

1. **School Administration System**
2. **Learning Management System (LMS)**
3. **Academic Assessment & Reporting Engine**

## Tech Stack

| Layer    | Technology                                                                 |
|----------|----------------------------------------------------------------------------|
| Backend  | Laravel 12 (PHP 8.3), Sanctum, Spatie Data & Query Builder, Scramble docs  |
| Frontend | Angular 21, Tailwind CSS 4, TypeScript 5.9                                 |
| Testing  | Pest (backend), Vitest (frontend)                                          |

## Module Index

| #  | Module File                              | Description                                      |
|----|------------------------------------------|--------------------------------------------------|
| 01 | `01-multi-tenancy.md`                   | Multi-tenant platform & school management         |
| 02 | `02-authentication-authorization.md`    | Auth, roles, permissions, portals                  |
| 03 | `03-school-administration.md`           | School setup: classes, departments, subjects, terms|
| 04 | `04-user-management.md`                 | Teachers, students, parents, HODs management       |
| 05 | `05-academic-structure.md`              | Grades, streams, academic years/terms              |
| 06 | `06-attendance.md`                      | Daily attendance recording & reporting             |
| 07 | `07-assessment-system.md`               | Tests, exams, continuous assessment, mark entry    |
| 08 | `08-result-calculation-reporting.md`    | Result calculation, report card generation         |
| 09 | `09-assignments-homework.md`            | Homework, projects, submissions, grading           |
| 10 | `10-learning-content.md`               | Recorded lessons, materials, e-learning            |
| 11 | `11-practice-exams-quizzes.md`         | Practice tests, quizzes, auto-grading              |
| 12 | `12-analytics-dashboard.md`            | Performance analytics, dashboards, insights        |
| 13 | `13-notifications-communication.md`    | Announcements, notifications, parent communication |
| 14 | `14-class-teacher-management.md`       | Class teacher portal, report approval, comments    |
| 15 | `15-hod-portal.md`                     | Head of Department oversight & reporting           |
| 16 | `16-student-portal.md`                 | Student learning access, progress tracking         |
| 17 | `17-parent-portal.md`                  | Parent monitoring & transparency features          |

## Development Phases

### Phase 1 — Core Foundation
- Multi-tenancy (Module 01)
- Authentication & Authorization (Module 02)
- School Administration (Module 03)
- User Management (Module 04)
- Academic Structure (Module 05)

### Phase 2 — Academic Operations
- Attendance System (Module 06)
- Assessment System (Module 07)
- Result Calculation & Reporting (Module 08)
- Class Teacher Management (Module 14)

### Phase 3 — Learning & Engagement
- Assignments & Homework (Module 09)
- Learning Content (Module 10)
- Practice Exams & Quizzes (Module 11)

### Phase 4 — Portals & Intelligence
- Analytics & Dashboards (Module 12)
- Notifications & Communication (Module 13)
- HOD Portal (Module 15)
- Student Portal (Module 16)
- Parent Portal (Module 17)
