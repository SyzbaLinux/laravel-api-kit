# Module 08 — Result Calculation & Report Card Generation

> Automatic result computation, grade assignment, and report card generation with teacher comments.

---

## Backend Tasks (Laravel)

### 8.1 Result Calculation Engine
- [ ] **B-08-001** — Create `ResultCalculationService` for computing final subject results
- [ ] **B-08-002** — Implement weighted calculation: `(CA_weight * CA_score) + (Exam_weight * Exam_score)`
- [ ] **B-08-003** — Create `SubjectResult` model (student_id, subject_id, term_id, ca_score, exam_score, final_mark, grade, school_id)
- [ ] **B-08-004** — Implement grade resolution from grading scale (map final_mark → grade letter)
- [ ] **B-08-005** — Calculate student total marks and average across all subjects
- [ ] **B-08-006** — Calculate student ranking within class
- [ ] **B-08-007** — Create endpoint to trigger result calculation for a class/term
- [ ] **B-08-008** — Create `SubjectResultData` DTO
- [ ] **B-08-009** — Write Pest tests for result calculations (edge cases: missing marks, zero scores)

### 8.2 Teacher Comments
- [ ] **B-08-010** — Create `SubjectComment` model (subject_result_id, teacher_id, comment)
- [ ] **B-08-011** — Create endpoint for subject teachers to add/edit comments
- [ ] **B-08-012** — Create `ClassTeacherComment` model (student_id, term_id, comment, teacher_id)
- [ ] **B-08-013** — Create endpoint for class teacher final comment
- [ ] **B-08-014** — Write Pest tests

### 8.3 Report Card Generation
- [ ] **B-08-015** — Create `ReportCard` model (student_id, term_id, status: draft/approved/published, school_id)
- [ ] **B-08-016** — Create `ReportCardService` to compile all data (results, attendance, comments)
- [ ] **B-08-017** — Create endpoint to generate report cards for a class/term
- [ ] **B-08-018** — Create endpoint to approve report cards (class teacher)
- [ ] **B-08-019** — Create endpoint to publish report cards (school admin)
- [ ] **B-08-020** — Create PDF export endpoint for individual report cards
- [ ] **B-08-021** — Create bulk PDF export endpoint (all students in a class)
- [ ] **B-08-022** — Create `ReportCardData` DTO
- [ ] **B-08-023** — Create `ReportCardPolicy` (role-based access)
- [ ] **B-08-024** — Write Pest tests

### 8.4 Promotion System
- [ ] **B-08-025** — Create promotion recommendation endpoint (class teacher)
- [ ] **B-08-026** — Implement promotion statuses: `promoted`, `retained`, `requires_support`
- [ ] **B-08-027** — Store promotion decision on report card
- [ ] **B-08-028** — Write Pest tests

---

## Frontend Tasks (Angular)

### 8.5 Result Calculation UI
- [ ] **F-08-001** — Create `ResultService` for API integration
- [ ] **F-08-002** — Create result calculation trigger page (select class, term → calculate)
- [ ] **F-08-003** — Display calculation progress/status
- [ ] **F-08-004** — Create class results overview table (all students, all subjects, averages, ranks)

### 8.6 Teacher Comment UI
- [ ] **F-08-005** — Create subject comment entry interface (list students, add comment per student)
- [ ] **F-08-006** — Create class teacher final comment interface
- [ ] **F-08-007** — Display comment templates/suggestions for quick entry

### 8.7 Report Card UI
- [ ] **F-08-008** — Create `ReportCardService` for API integration
- [ ] **F-08-009** — Create report card preview page (styled report card view)
- [ ] **F-08-010** — Create report card approval workflow (class teacher review → approve)
- [ ] **F-08-011** — Create report card publishing interface (school admin: publish/unpublish)
- [ ] **F-08-012** — Create individual report card PDF download button
- [ ] **F-08-013** — Create bulk report card PDF download
- [ ] **F-08-014** — Create promotion recommendation form (per student: promoted/retained/support)
