# Module 14 — Class Teacher Management

> Class teacher portal for student monitoring, report approval, comments, and promotion.

---

## Backend Tasks (Laravel)

### 14.1 Class Teacher Dashboard Data
- [ ] **B-14-001** — Create `ClassTeacherDashboardController` with overview endpoint
- [ ] **B-14-002** — Endpoint: class student list with summary (attendance %, avg mark, rank)
- [ ] **B-14-003** — Endpoint: class attendance summary (present/absent/late totals)
- [ ] **B-14-004** — Endpoint: class average performance per subject
- [ ] **B-14-005** — Write Pest tests

### 14.2 Student Monitoring
- [ ] **B-14-006** — Create endpoint: student full profile (all subjects, marks, attendance for term)
- [ ] **B-14-007** — Create endpoint: identify struggling students (below threshold average)
- [ ] **B-14-008** — Create endpoint: assignment completion rate per student
- [ ] **B-14-009** — Write Pest tests

### 14.3 Report Review & Approval
- [ ] **B-14-010** — Create endpoint: list all student reports for class (with status: draft/approved/published)
- [ ] **B-14-011** — Create endpoint: review report details (all subject results, comments, attendance)
- [ ] **B-14-012** — Create endpoint: add/edit class teacher final comment per student
- [ ] **B-14-013** — Create endpoint: approve report card (changes status to approved)
- [ ] **B-14-014** — Create endpoint: bulk approve all class reports
- [ ] **B-14-015** — Ensure only class teacher of that class can approve
- [ ] **B-14-016** — Write Pest tests

### 14.4 Promotion Recommendations
- [ ] **B-14-017** — Create endpoint: set promotion recommendation per student
- [ ] **B-14-018** — Promotion values: `promoted`, `retained`, `requires_support`, custom text
- [ ] **B-14-019** — Write Pest tests

---

## Frontend Tasks (Angular)

### 14.5 Class Teacher Dashboard UI
- [ ] **F-14-001** — Create `ClassTeacherService` for API integration
- [ ] **F-14-002** — Create class teacher dashboard with class overview widgets
- [ ] **F-14-003** — Create student list table with sortable columns (name, average, rank, attendance %)
- [ ] **F-14-004** — Create class attendance summary chart
- [ ] **F-14-005** — Create subject performance bar chart

### 14.6 Student Monitoring UI
- [ ] **F-14-006** — Create student detail page (all-subjects view, attendance history, assignment status)
- [ ] **F-14-007** — Create struggling students highlight panel
- [ ] **F-14-008** — Create student performance trend chart

### 14.7 Report Approval UI
- [ ] **F-14-009** — Create report review list (students with report status indicators)
- [ ] **F-14-010** — Create report detail review page (all results, comments, attendance in one view)
- [ ] **F-14-011** — Create final comment input form per student
- [ ] **F-14-012** — Create approve button with confirmation dialog
- [ ] **F-14-013** — Create bulk approve action
- [ ] **F-14-014** — Create promotion recommendation dropdown per student
