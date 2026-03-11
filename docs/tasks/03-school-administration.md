# Module 03 — School Administration

> Core school setup: classes, departments, subjects, and academic terms configuration.

---

## Backend Tasks (Laravel)

### 3.1 Department Management
- [ ] **B-03-001** — Create `Department` model (name, description, school_id)
- [ ] **B-03-002** — Create `DepartmentData` DTO
- [ ] **B-03-003** — Create `DepartmentController` with CRUD endpoints
- [ ] **B-03-004** — Create `DepartmentPolicy` (school admin only)
- [ ] **B-03-005** — API routes: `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/{id}`
- [ ] **B-03-006** — Implement HOD assignment to department
- [ ] **B-03-007** — Write Pest tests for department CRUD

### 3.2 Subject Management
- [ ] **B-03-008** — Create `Subject` model (name, code, department_id, school_id, level)
- [ ] **B-03-009** — Create `SubjectData` DTO
- [ ] **B-03-010** — Create `SubjectController` with CRUD endpoints
- [ ] **B-03-011** — Implement subject-department association
- [ ] **B-03-012** — Implement subject-teacher assignment (pivot: teacher_id, subject_id, class_id)
- [ ] **B-03-013** — API routes: `GET/POST /api/subjects`, subject assignment endpoints
- [ ] **B-03-014** — Write Pest tests for subject management

### 3.3 Class Management
- [ ] **B-03-015** — Create `SchoolClass` model (name, grade_level, stream, capacity, school_id)
- [ ] **B-03-016** — Create `SchoolClassData` DTO
- [ ] **B-03-017** — Create `SchoolClassController` with CRUD endpoints
- [ ] **B-03-018** — Implement student enrollment to class (pivot table)
- [ ] **B-03-019** — Implement class teacher assignment endpoint
- [ ] **B-03-020** — Implement subject assignment to class
- [ ] **B-03-021** — API routes: `GET/POST /api/classes`, enrollment/assignment endpoints
- [ ] **B-03-022** — Write Pest tests for class management

### 3.4 Academic Year & Term Management
- [ ] **B-03-023** — Create `AcademicYear` model (name, start_date, end_date, is_current, school_id)
- [ ] **B-03-024** — Create `AcademicTerm` model (name, academic_year_id, start_date, end_date, is_current)
- [ ] **B-03-025** — Create controllers for academic year and term CRUD
- [ ] **B-03-026** — Implement "set current" functionality for year and term
- [ ] **B-03-027** — Create `AcademicYearData` and `AcademicTermData` DTOs
- [ ] **B-03-028** — Write Pest tests

### 3.5 Timetable Management
- [ ] **B-03-029** — Create `Timetable` model (class_id, subject_id, teacher_id, day, start_time, end_time)
- [ ] **B-03-030** — Create `TimetableController` with CRUD operations
- [ ] **B-03-031** — Implement conflict detection (teacher double-booking, class overlap)
- [ ] **B-03-032** — Write Pest tests for timetable operations

---

## Frontend Tasks (Angular)

### 3.6 Department Management UI
- [ ] **F-03-001** — Create `DepartmentService` for API integration
- [ ] **F-03-002** — Create department listing page with CRUD actions
- [ ] **F-03-003** — Create department form dialog (create/edit)
- [ ] **F-03-004** — Create HOD assignment dropdown within department form

### 3.7 Subject Management UI
- [ ] **F-03-005** — Create `SubjectService` for API integration
- [ ] **F-03-006** — Create subject listing page with filters (department, level)
- [ ] **F-03-007** — Create subject form dialog (create/edit)
- [ ] **F-03-008** — Create subject-teacher assignment interface
- [ ] **F-03-009** — Create subject-class assignment interface

### 3.8 Class Management UI
- [ ] **F-03-010** — Create `ClassService` for API integration
- [ ] **F-03-011** — Create class listing page with grade-level grouping
- [ ] **F-03-012** — Create class form dialog (create/edit)
- [ ] **F-03-013** — Create student enrollment interface (add/remove students from class)
- [ ] **F-03-014** — Create class teacher assignment interface
- [ ] **F-03-015** — Create class detail view (students, subjects, teacher)

### 3.9 Academic Year & Term UI
- [ ] **F-03-016** — Create `AcademicYearService` for API integration
- [ ] **F-03-017** — Create academic year listing and creation form
- [ ] **F-03-018** — Create term management within academic year (create/edit terms)
- [ ] **F-03-019** — Create "set current" action buttons

### 3.10 Timetable UI
- [ ] **F-03-020** — Create `TimetableService` for API integration
- [ ] **F-03-021** — Create weekly timetable grid view (drag-and-drop optional)
- [ ] **F-03-022** — Create timetable entry form (subject, teacher, time slot)
- [ ] **F-03-023** — Display conflict warnings in real-time
