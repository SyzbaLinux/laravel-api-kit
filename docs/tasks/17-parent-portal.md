# Module 17 — Parent Portal

> Parent-facing features: monitoring children's academics, attendance, homework, and receiving communications.

---

## Backend Tasks (Laravel)

### 17.1 Parent Dashboard Data
- [ ] **B-17-001** — Create `ParentDashboardController` with overview endpoint
- [ ] **B-17-002** — Endpoint: list linked children (students) with summary info
- [ ] **B-17-003** — Endpoint: child performance summary (average, rank, attendance %)
- [ ] **B-17-004** — Endpoint: child homework status (pending, overdue, completed counts)
- [ ] **B-17-005** — Write Pest tests

### 17.2 Academic Monitoring
- [ ] **B-17-006** — Endpoint: child report cards list (by term)
- [ ] **B-17-007** — Endpoint: child report card detail
- [ ] **B-17-008** — Endpoint: child subject marks detail
- [ ] **B-17-009** — Endpoint: child performance trend (term-over-term)
- [ ] **B-17-010** — Create `ParentPortalPolicy` (parents can only view their linked children's data)
- [ ] **B-17-011** — Write Pest tests

### 17.3 Attendance Monitoring
- [ ] **B-17-012** — Endpoint: child attendance history (date range)
- [ ] **B-17-013** — Endpoint: child attendance summary (present %, absent %, late %)
- [ ] **B-17-014** — Write Pest tests

### 17.4 Homework Monitoring
- [ ] **B-17-015** — Endpoint: child assignments list (pending, submitted, graded)
- [ ] **B-17-016** — Endpoint: child assignment completion rate
- [ ] **B-17-017** — Write Pest tests

### 17.5 Communication
- [ ] **B-17-018** — Endpoint: list school announcements for parent
- [ ] **B-17-019** — Endpoint: list notifications for parent (attendance alerts, report published, etc.)
- [ ] **B-17-020** — Write Pest tests

---

## Frontend Tasks (Angular)

### 17.6 Parent Dashboard UI
- [ ] **F-17-001** — Create `ParentPortalService` for API integration
- [ ] **F-17-002** — Create parent dashboard with:
  - Children overview cards (one per child)
  - Performance summary per child
  - Recent alerts/notifications
- [ ] **F-17-003** — Create child selector (for parents with multiple children)

### 17.7 Academic Monitoring UI
- [ ] **F-17-004** — Create child report card listing page
- [ ] **F-17-005** — Create child report card detail view (styled report card)
- [ ] **F-17-006** — Create child subject marks page
- [ ] **F-17-007** — Create child performance trend chart

### 17.8 Attendance Monitoring UI
- [ ] **F-17-008** — Create child attendance history page (calendar/table view)
- [ ] **F-17-009** — Create child attendance summary widget

### 17.9 Homework Monitoring UI
- [ ] **F-17-010** — Create child homework listing page (pending, overdue, completed)
- [ ] **F-17-011** — Create homework completion rate widget

### 17.10 Communication UI
- [ ] **F-17-012** — Create school announcements page
- [ ] **F-17-013** — Create notifications page with alerting
- [ ] **F-17-014** — Display important alerts prominently on dashboard (e.g., child absent today)
