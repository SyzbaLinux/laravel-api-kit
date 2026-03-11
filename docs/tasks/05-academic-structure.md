# Module 05 — Academic Structure

> Defines the Zimbabwean education levels, grades, streams, and academic periods.

---

## Backend Tasks (Laravel)

### 5.1 Education Level Configuration
- [ ] **B-05-001** — Create `EducationLevel` model (name: ECD, Primary, Secondary; school_id)
- [ ] **B-05-002** — Create seeder with default education levels
- [ ] **B-05-003** — Create `EducationLevelData` DTO
- [ ] **B-05-004** — Create `EducationLevelController` for listing and configuration

### 5.2 Grade Level Management
- [ ] **B-05-005** — Create `GradeLevel` model (name, education_level_id, order, school_id)
- [ ] **B-05-006** — Create seeder with default grade levels (ECD A/B, Grade 1-7, Form 1-6)
- [ ] **B-05-007** — Create `GradeLevelData` DTO
- [ ] **B-05-008** — Create `GradeLevelController` for CRUD operations
- [ ] **B-05-009** — Write Pest tests

### 5.3 Stream Management
- [ ] **B-05-010** — Implement stream (class sections) within grade levels (e.g., Grade 3A, 3B, 3C)
- [ ] **B-05-011** — Create stream creation endpoint tied to grade level
- [ ] **B-05-012** — Ensure stream names are unique per grade per academic year
- [ ] **B-05-013** — Write Pest tests

### 5.4 Academic Calendar
- [ ] **B-05-014** — Create `AcademicEvent` model (title, date, type, term_id, school_id)
- [ ] **B-05-015** — Create `AcademicEventController` for CRUD
- [ ] **B-05-016** — Create event types: exam period, holiday, registration, etc.
- [ ] **B-05-017** — Write Pest tests

### 5.5 Grading Configuration
- [ ] **B-05-018** — Create `GradingScale` model (name, school_id, is_default)
- [ ] **B-05-019** — Create `GradeRange` model (grading_scale_id, grade_letter, min_mark, max_mark, descriptor)
- [ ] **B-05-020** — Create default grading scale seeder (A: 80-100, B: 60-79, etc.)
- [ ] **B-05-021** — Create `GradingScaleController` for CRUD
- [ ] **B-05-022** — Allow schools to customize their grading scales
- [ ] **B-05-023** — Write Pest tests

---

## Frontend Tasks (Angular)

### 5.6 Academic Structure UI
- [ ] **F-05-001** — Create `AcademicStructureService` for API integration
- [ ] **F-05-002** — Create education level configuration page
- [ ] **F-05-003** — Create grade level management page (list, add, reorder)
- [ ] **F-05-004** — Create stream management interface within grade levels

### 5.7 Academic Calendar UI
- [ ] **F-05-005** — Create `AcademicCalendarService` for API integration
- [ ] **F-05-006** — Create calendar view (monthly/term view) showing academic events
- [ ] **F-05-007** — Create event creation/edit form

### 5.8 Grading Configuration UI
- [ ] **F-05-008** — Create `GradingService` for API integration
- [ ] **F-05-009** — Create grading scale configuration page
- [ ] **F-05-010** — Create grade range form (add/edit/remove ranges with live preview)
- [ ] **F-05-011** — Display grading scale preview table
