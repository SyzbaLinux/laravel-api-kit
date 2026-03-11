# Module 07 — Assessment System

> Tests, exams, continuous assessment, and mark entry for student evaluation.

---

## Backend Tasks (Laravel)

### 7.1 Assessment Type Configuration
- [ ] **B-07-001** — Create `AssessmentType` model (name, category, weight, school_id)
- [ ] **B-07-002** — Categories: `continuous_assessment`, `examination`
- [ ] **B-07-003** — Create seeder with defaults (Monthly Test, Exercise, Mid-term, Final Exam)
- [ ] **B-07-004** — Create `AssessmentTypeData` DTO
- [ ] **B-07-005** — Create `AssessmentTypeController` for CRUD
- [ ] **B-07-006** — Write Pest tests

### 7.2 Assessment Management
- [ ] **B-07-007** — Create `Assessment` model (title, assessment_type_id, subject_id, class_id, term_id, max_score, date, teacher_id, school_id)
- [ ] **B-07-008** — Create `AssessmentData` DTO
- [ ] **B-07-009** — Create `AssessmentController` with CRUD endpoints
- [ ] **B-07-010** — API routes: `GET/POST /api/assessments`, filtering by subject, class, term, type
- [ ] **B-07-011** — Create `AssessmentPolicy` (teachers manage their own assessments)
- [ ] **B-07-012** — Write Pest tests

### 7.3 Mark Entry
- [ ] **B-07-013** — Create `Mark` model (assessment_id, student_id, score, comment, school_id)
- [ ] **B-07-014** — Create `MarkData` DTO
- [ ] **B-07-015** — Create `MarkController` with entry/update endpoints
- [ ] **B-07-016** — Implement bulk mark entry endpoint (enter marks for entire class at once)
- [ ] **B-07-017** — Validate marks against max_score
- [ ] **B-07-018** — Prevent duplicate mark entries per student per assessment
- [ ] **B-07-019** — Create `MarkPolicy` (teachers enter marks for their subjects/classes only)
- [ ] **B-07-020** — Write Pest tests

### 7.4 Continuous Assessment Calculation
- [ ] **B-07-021** — Create `ContinuousAssessmentService` to calculate aggregated CA scores
- [ ] **B-07-022** — Support average and median calculation methods (configurable per school)
- [ ] **B-07-023** — Create endpoint to retrieve calculated CA score per student per subject per term
- [ ] **B-07-024** — Write Pest tests for CA calculations

---

## Frontend Tasks (Angular)

### 7.5 Assessment Type Configuration UI
- [ ] **F-07-001** — Create `AssessmentService` for API integration
- [ ] **F-07-002** — Create assessment type configuration page (list, add, edit, set weights)
- [ ] **F-07-003** — Display weight distribution summary (ensure weights sum correctly)

### 7.6 Assessment Management UI
- [ ] **F-07-004** — Create assessment listing page with filters (subject, class, term, type)
- [ ] **F-07-005** — Create assessment creation form (title, type, subject, class, date, max score)
- [ ] **F-07-006** — Create assessment detail view

### 7.7 Mark Entry UI
- [ ] **F-07-007** — Create mark entry spreadsheet-style grid (rows: students, columns: score, comment)
- [ ] **F-07-008** — Implement inline validation (score <= max_score, required fields)
- [ ] **F-07-009** — Implement bulk save with progress indicator
- [ ] **F-07-010** — Display class statistics after mark entry (average, highest, lowest, pass rate)
- [ ] **F-07-011** — Create mark review view for HODs and class teachers
