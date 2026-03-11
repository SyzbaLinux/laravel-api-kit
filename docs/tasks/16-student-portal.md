# Module 16 — Student Portal

> Student-facing features: learning access, assignments, quizzes, report viewing, and progress tracking.

---

## Backend Tasks (Laravel)

### 16.1 Student Dashboard Data
- [ ] **B-16-001** — Create `StudentDashboardController` with overview endpoint
- [ ] **B-16-002** — Endpoint: current subjects list with teacher names
- [ ] **B-16-003** — Endpoint: upcoming assignments (pending, due soon)
- [ ] **B-16-004** — Endpoint: recent marks/grades (latest assessments)
- [ ] **B-16-005** — Endpoint: attendance summary for current term
- [ ] **B-16-006** — Endpoint: available quizzes
- [ ] **B-16-007** — Write Pest tests

### 16.2 Student Academic Access
- [ ] **B-16-008** — Endpoint: student report cards list (by term)
- [ ] **B-16-009** — Endpoint: student report card detail (full results, comments, attendance)
- [ ] **B-16-010** — Endpoint: student subject marks detail (all assessments for a subject/term)
- [ ] **B-16-011** — Endpoint: student grades/averages across subjects
- [ ] **B-16-012** — Create `StudentPortalPolicy` (students can only view their own data)
- [ ] **B-16-013** — Write Pest tests

### 16.3 Student Learning Access
- [ ] **B-16-014** — Endpoint: list available learning materials for student's class/subjects
- [ ] **B-16-015** — Endpoint: list available recorded lessons for student's class/subjects
- [ ] **B-16-016** — Write Pest tests

---

## Frontend Tasks (Angular)

### 16.4 Student Dashboard UI
- [ ] **F-16-001** — Create `StudentPortalService` for API integration
- [ ] **F-16-002** — Create student dashboard with:
  - Upcoming assignments widget
  - Recent grades widget
  - Attendance summary widget
  - Available quizzes widget
- [ ] **F-16-003** — Create subject list page

### 16.5 Academic Results UI
- [ ] **F-16-004** — Create report card listing page (list by term)
- [ ] **F-16-005** — Create report card detail view (styled like a real report card)
- [ ] **F-16-006** — Create subject marks detail page (all assessments, CA, exam, final)
- [ ] **F-16-007** — Create performance progress chart (term-over-term trend)

### 16.6 Learning Library UI
- [ ] **F-16-008** — Create learning materials library (browse by subject)
- [ ] **F-16-009** — Create recorded lessons viewer (video player)
- [ ] **F-16-010** — Create document viewer for study materials

### 16.7 Assignments UI (Student View)
- [ ] **F-16-011** — Create assignment listing page (pending, submitted, graded tabs)
- [ ] **F-16-012** — Create assignment detail and submission page
- [ ] **F-16-013** — Create feedback view (teacher comments on graded work)

### 16.8 Attendance UI (Student View)
- [ ] **F-16-014** — Create attendance history page (calendar or table view)
- [ ] **F-16-015** — Create attendance summary (present %, absent %, late %)
