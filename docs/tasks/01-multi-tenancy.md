# Module 01 — Multi-Tenancy & Platform Management

> Each school operates as an independent tenant. The Super Administrator manages all schools centrally.

---

## Backend Tasks (Laravel)

### 1.1 Tenant Infrastructure
- [ ] **B-01-001** — Implement tenant identification strategy (subdomain or header-based)
- [ ] **B-01-002** — Create `School` model with tenant-scoped fields (name, slug, logo, contact, subscription status)
- [ ] **B-01-003** — Create tenant-scoping middleware to resolve current tenant from request
- [ ] **B-01-004** — Implement global query scopes for automatic tenant filtering on all tenant-aware models
- [ ] **B-01-005** — Create `TenantAware` trait for models requiring tenant isolation
- [ ] **B-01-006** — Implement tenant data isolation tests to ensure cross-tenant data leakage is impossible

### 1.2 School CRUD (Super Admin)
- [ ] **B-01-007** — Create `SchoolData` (Spatie Data) for school request/response DTOs
- [ ] **B-01-008** — Create `SchoolController` with full CRUD endpoints
- [ ] **B-01-009** — Implement `SchoolPolicy` to restrict access to Super Admin only
- [ ] **B-01-010** — Create API routes: `GET/POST /api/schools`, `GET/PUT/DELETE /api/schools/{school}`
- [ ] **B-01-011** — Implement school activation/deactivation endpoint
- [ ] **B-01-012** — Add Spatie Query Builder filters (name, status, subscription)
- [ ] **B-01-013** — Write Pest feature tests for all school CRUD operations

### 1.3 Subscription & Service Plans
- [ ] **B-01-014** — Create `SubscriptionPlan` model (name, max_students, max_teachers, features, price)
- [ ] **B-01-015** — Create `SubscriptionPlanController` for plan CRUD (Super Admin)
- [ ] **B-01-016** — Implement school-plan assignment and enforcement middleware
- [ ] **B-01-017** — Create usage tracking service (student count, teacher count vs plan limits)
- [ ] **B-01-018** — Write Pest tests for subscription enforcement

### 1.4 Platform Monitoring
- [ ] **B-01-019** — Create platform usage statistics endpoint (total schools, students, teachers)
- [ ] **B-01-020** — Create system health/status endpoint
- [ ] **B-01-021** — Implement platform-wide analytics aggregation service

---

## Frontend Tasks (Angular)

### 1.5 Super Admin — School Management UI
- [ ] **F-01-001** — Create `SchoolService` for school API integration
- [ ] **F-01-002** — Create school listing page with search, filter, and pagination
- [ ] **F-01-003** — Create school creation/edit form with validation
- [ ] **F-01-004** — Create school detail view with status indicators
- [ ] **F-01-005** — Implement school activation/deactivation toggle
- [ ] **F-01-006** — Create subscription plan management page
- [ ] **F-01-007** — Create plan assignment dialog for schools

### 1.6 Super Admin — Platform Dashboard
- [ ] **F-01-008** — Create Super Admin dashboard layout
- [ ] **F-01-009** — Build platform statistics widgets (total schools, users, active plans)
- [ ] **F-01-010** — Create system usage charts (trends over time)
- [ ] **F-01-011** — Implement tenant switcher for admin debugging

### 1.7 Tenant Context
- [ ] **F-01-012** — Create `TenantService` to manage current tenant context
- [ ] **F-01-013** — Create HTTP interceptor to attach tenant identifier to all API requests
- [ ] **F-01-014** — Implement tenant-aware route guards
