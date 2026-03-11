# Module 15 — Head of Department (HOD) Portal

> Department oversight: monitoring teachers, reviewing marks, departmental analytics.

---

## Backend Tasks (Laravel)

### 15.1 HOD Dashboard Data
- [ ] **B-15-001** — Create `HODDashboardController` with overview endpoint
- [ ] **B-15-002** — Endpoint: list teachers within the department
- [ ] **B-15-003** — Endpoint: list subjects within the department
- [ ] **B-15-004** — Endpoint: department performance summary (avg pass rate, avg score)
- [ ] **B-15-005** — Write Pest tests

### 15.2 Teacher Monitoring
- [ ] **B-15-006** — Create endpoint: teacher performance within department (class averages per teacher)
- [ ] **B-15-007** — Create endpoint: teacher mark entry status (subjects with complete/incomplete marks)
- [ ] **B-15-008** — Write Pest tests

### 15.3 Mark Validation
- [ ] **B-15-009** — Create endpoint: view all marks for a subject/class (for review)
- [ ] **B-15-010** — Create endpoint: flag marks for review (HOD can request teacher to re-check)
- [ ] **B-15-011** — Create mark validation workflow (reviewed/flagged/approved status)
- [ ] **B-15-012** — Write Pest tests

### 15.4 Departmental Reports
- [ ] **B-15-013** — Create endpoint: subject pass rate across all classes
- [ ] **B-15-014** — Create endpoint: department performance trend over terms
- [ ] **B-15-015** — Create endpoint: departmental learning material statistics
- [ ] **B-15-016** — Write Pest tests

### 15.5 Departmental Learning Materials
- [ ] **B-15-017** — Extend learning material upload to support HOD-level uploads
- [ ] **B-15-018** — Write Pest tests

---

## Frontend Tasks (Angular)

### 15.6 HOD Dashboard UI
- [ ] **F-15-001** — Create `HODService` for API integration
- [ ] **F-15-002** — Create HOD dashboard with department overview widgets
- [ ] **F-15-003** — Create department teacher listing with performance indicators
- [ ] **F-15-004** — Create department subject listing with pass rate indicators

### 15.7 Teacher Monitoring UI
- [ ] **F-15-005** — Create teacher performance detail view (class averages, mark entry status)
- [ ] **F-15-006** — Create mark entry completion tracker (which teachers have/haven't entered marks)

### 15.8 Mark Validation UI
- [ ] **F-15-007** — Create mark review spreadsheet view (view all marks for subject/class)
- [ ] **F-15-008** — Create flagging interface (flag individual marks or bulk flag)
- [ ] **F-15-009** — Display mark validation status indicators

### 15.9 Department Reports UI
- [ ] **F-15-010** — Create subject pass rate comparison chart
- [ ] **F-15-011** — Create department performance trend chart (term-over-term)
- [ ] **F-15-012** — Create departmental learning materials management page
