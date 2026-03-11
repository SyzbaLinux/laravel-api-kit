# Module 02 — Authentication & Authorization

> Sanctum-based authentication with role-based access control across all portals.

---

## Backend Tasks (Laravel)

### 2.1 Authentication
- [ ] **B-02-001** — Configure Laravel Sanctum for API token authentication
- [ ] **B-02-002** — Create `AuthController` with login, logout, refresh endpoints
- [ ] **B-02-003** — Create `RegisterController` for school admin registration (Super Admin initiated)
- [ ] **B-02-004** — Implement password reset flow (forgot password, reset token, update)
- [ ] **B-02-005** — Create `AuthData` (Spatie Data) for login/register request DTOs
- [ ] **B-02-006** — Implement email verification flow
- [ ] **B-02-007** — Write Pest tests for all auth flows

### 2.2 Role & Permission System
- [ ] **B-02-008** — Define system roles: `super_admin`, `school_admin`, `hod`, `teacher`, `class_teacher`, `student`, `parent`
- [ ] **B-02-009** — Create `Role` model and seeder with default roles
- [ ] **B-02-010** — Create `Permission` model and define granular permissions per module
- [ ] **B-02-011** — Implement role-permission assignment (many-to-many)
- [ ] **B-02-012** — Create authorization middleware for role-based route protection
- [ ] **B-02-013** — Create policy classes for each resource (SchoolPolicy, UserPolicy, etc.)
- [ ] **B-02-014** — Write Pest tests for role-based access enforcement

### 2.3 User Profile
- [ ] **B-02-015** — Create `ProfileController` for viewing/updating own profile
- [ ] **B-02-016** — Implement password change endpoint
- [ ] **B-02-017** — Create `ProfileData` DTO for profile responses

---

## Frontend Tasks (Angular)

### 2.4 Authentication UI
- [ ] **F-02-001** — Create `AuthService` for login/logout/register API calls
- [ ] **F-02-002** — Create login page with email/password form and validation
- [ ] **F-02-003** — Create password reset request page
- [ ] **F-02-004** — Create password reset confirmation page
- [ ] **F-02-005** — Implement JWT/token storage service (secure storage)
- [ ] **F-02-006** — Create HTTP interceptor for attaching auth token to requests
- [ ] **F-02-007** — Create HTTP interceptor for handling 401 responses (auto-logout)

### 2.5 Authorization & Routing
- [ ] **F-02-008** — Create `AuthGuard` for protecting authenticated routes
- [ ] **F-02-009** — Create `RoleGuard` for role-based route access
- [ ] **F-02-010** — Implement role-aware navigation (show/hide menu items by role)
- [ ] **F-02-011** — Create portal-specific route modules (admin, teacher, student, parent, HOD)
- [ ] **F-02-012** — Implement `hasPermission` directive for conditional UI rendering

### 2.6 Profile Management UI
- [ ] **F-02-013** — Create profile view/edit page
- [ ] **F-02-014** — Create password change form
- [ ] **F-02-015** — Create avatar upload component
