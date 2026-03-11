# Module 06 — Attendance System

> Daily attendance recording for students with reporting for teachers, class teachers, and parents.

---

## Backend Tasks (Laravel)

### 6.1 Attendance Recording
- [ ] **B-06-001** — Create `Attendance` model (student_id, class_id, date, status, remarks, recorded_by, school_id)
- [ ] **B-06-002** — Status enum: `present`, `absent`, `late`, `excused`
- [ ] **B-06-003** — Create `AttendanceData` DTO
- [ ] **B-06-004** — Create `AttendanceController` with record/update endpoints
- [ ] **B-06-005** — Implement bulk attendance recording endpoint (mark entire class at once)
- [ ] **B-06-006** — Prevent duplicate attendance entries per student per date per class
- [ ] **B-06-007** — Create `AttendancePolicy` (teachers can record for their classes only)
- [ ] **B-06-008** — Write Pest tests

### 6.2 Attendance Queries & Reporting
- [ ] **B-06-009** — Create attendance summary endpoint per student (for a term/year)
- [ ] **B-06-010** — Create attendance summary endpoint per class
- [ ] **B-06-011** — Create daily attendance report endpoint (percentage present per class)
- [ ] **B-06-012** — Create student attendance history endpoint with date range filters
- [ ] **B-06-013** — Implement attendance aggregation service (total days, present, absent, late, excused)
- [ ] **B-06-014** — Write Pest tests for reporting endpoints

---

## Frontend Tasks (Angular)

### 6.3 Attendance Recording UI
- [ ] **F-06-001** — Create `AttendanceService` for API integration
- [ ] **F-06-002** — Create daily attendance form (class selector + student list with status toggles)
- [ ] **F-06-003** — Implement "mark all present" quick action
- [ ] **F-06-004** — Add remarks input for individual students
- [ ] **F-06-005** — Display attendance recording confirmation/success feedback

### 6.4 Attendance Reporting UI
- [ ] **F-06-006** — Create class attendance summary view (daily/weekly/monthly)
- [ ] **F-06-007** — Create student attendance history page (calendar or table view)
- [ ] **F-06-008** — Create attendance statistics dashboard (charts: attendance rate over time)
- [ ] **F-06-009** — Highlight frequently absent students with warning indicators
- [ ] **F-06-010** — Create attendance report export (PDF/CSV)
