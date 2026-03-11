# Module 09 — Assignments & Homework

> Teachers create assignments, students submit work, teachers grade and provide feedback.

---

## Backend Tasks (Laravel)

### 9.1 Assignment Management
- [ ] **B-09-001** — Create `Assignment` model (title, description, subject_id, class_id, teacher_id, term_id, type, due_date, max_score, submission_format, school_id)
- [ ] **B-09-002** — Assignment types: `homework`, `project`, `exercise`, `revision`
- [ ] **B-09-003** — Create `AssignmentData` DTO
- [ ] **B-09-004** — Create `AssignmentController` with CRUD endpoints
- [ ] **B-09-005** — API routes: `GET/POST /api/assignments`, filtering by class, subject, status
- [ ] **B-09-006** — Implement file attachment support for assignment instructions
- [ ] **B-09-007** — Create `AssignmentPolicy` (teachers manage their own)
- [ ] **B-09-008** — Write Pest tests

### 9.2 Student Submissions
- [ ] **B-09-009** — Create `Submission` model (assignment_id, student_id, content, file_path, submitted_at, status, school_id)
- [ ] **B-09-010** — Submission statuses: `pending`, `submitted`, `late`, `graded`
- [ ] **B-09-011** — Create `SubmissionData` DTO
- [ ] **B-09-012** — Create `SubmissionController` with submit/update endpoints
- [ ] **B-09-013** — Implement file upload for student submissions
- [ ] **B-09-014** — Automatically mark as "late" if submitted after due_date
- [ ] **B-09-015** — Prevent multiple submissions per student per assignment (update instead)
- [ ] **B-09-016** — Write Pest tests

### 9.3 Grading & Feedback
- [ ] **B-09-017** — Create grading endpoint (score, feedback per submission)
- [ ] **B-09-018** — Create bulk grading endpoint
- [ ] **B-09-019** — Implement submission statistics (submitted count, graded count, average score)
- [ ] **B-09-020** — Write Pest tests

---

## Frontend Tasks (Angular)

### 9.4 Assignment Management UI (Teacher)
- [ ] **F-09-001** — Create `AssignmentService` for API integration
- [ ] **F-09-002** — Create assignment listing page with filters (class, subject, status, type)
- [ ] **F-09-003** — Create assignment creation form (title, instructions, due date, max score, attachments)
- [ ] **F-09-004** — Create assignment detail view with submission statistics

### 9.5 Submission UI (Student)
- [ ] **F-09-005** — Create `SubmissionService` for API integration
- [ ] **F-09-006** — Create assignment list view for students (pending, submitted, graded)
- [ ] **F-09-007** — Create submission form (text input + file upload)
- [ ] **F-09-008** — Display due date countdown and late warning
- [ ] **F-09-009** — Create submission confirmation with status

### 9.6 Grading UI (Teacher)
- [ ] **F-09-010** — Create submission review page (list all submissions for an assignment)
- [ ] **F-09-011** — Create grading interface (score input + feedback textarea per submission)
- [ ] **F-09-012** — Display file viewer for submitted documents
- [ ] **F-09-013** — Create grading statistics summary (average, distribution chart)
