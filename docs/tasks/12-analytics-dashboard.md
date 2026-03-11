# Module 12 — Analytics & Dashboards

> Performance analytics for all levels: student, class, department, and school-wide.

---

## Backend Tasks (Laravel)

### 12.1 Student Analytics
- [ ] **B-12-001** — Create endpoint: student performance summary (average, rank, grade distribution)
- [ ] **B-12-002** — Create endpoint: student performance trend over terms
- [ ] **B-12-003** — Create endpoint: student subject-level breakdown (strongest/weakest subjects)
- [ ] **B-12-004** — Write Pest tests

### 12.2 Class Analytics
- [ ] **B-12-005** — Create endpoint: class average per subject
- [ ] **B-12-006** — Create endpoint: class ranking table (all students ranked)
- [ ] **B-12-007** — Create endpoint: class pass rate per subject
- [ ] **B-12-008** — Create endpoint: class performance comparison across terms
- [ ] **B-12-009** — Write Pest tests

### 12.3 Department Analytics
- [ ] **B-12-010** — Create endpoint: department subject pass rates
- [ ] **B-12-011** — Create endpoint: department average performance
- [ ] **B-12-012** — Create endpoint: teacher performance within department (avg class scores)
- [ ] **B-12-013** — Write Pest tests

### 12.4 School-Wide Analytics
- [ ] **B-12-014** — Create endpoint: overall school performance summary
- [ ] **B-12-015** — Create endpoint: grade-level comparison (ECD vs Primary vs Secondary)
- [ ] **B-12-016** — Create endpoint: attendance overview across school
- [ ] **B-12-017** — Create endpoint: top performing students school-wide
- [ ] **B-12-018** — Write Pest tests

### 12.5 Analytics Service Layer
- [ ] **B-12-019** — Create `AnalyticsService` with caching for expensive queries
- [ ] **B-12-020** — Implement analytics refresh/invalidation strategy
- [ ] **B-12-021** — Write Pest tests

---

## Frontend Tasks (Angular)

### 12.6 School Admin Dashboard
- [ ] **F-12-001** — Create `AnalyticsService` for API integration
- [ ] **F-12-002** — Create school dashboard with key metrics (enrollment, attendance rate, pass rate)
- [ ] **F-12-003** — Create enrollment statistics widget
- [ ] **F-12-004** — Create performance overview charts (bar/line charts)
- [ ] **F-12-005** — Create top students leaderboard widget

### 12.7 Class Analytics UI
- [ ] **F-12-006** — Create class performance dashboard (averages, rankings, pass rates)
- [ ] **F-12-007** — Create subject performance comparison chart per class
- [ ] **F-12-008** — Create term comparison chart

### 12.8 Department Analytics UI
- [ ] **F-12-009** — Create department performance dashboard
- [ ] **F-12-010** — Create subject pass rate charts per department
- [ ] **F-12-011** — Create teacher effectiveness comparison (anonymized or ranked)

### 12.9 Student Progress UI
- [ ] **F-12-012** — Create student progress dashboard (personal performance over time)
- [ ] **F-12-013** — Create subject strength/weakness radar chart
- [ ] **F-12-014** — Create term-over-term trend line chart
