# Module 04 — User Management

> Managing teachers, students, parents, and HODs within each school tenant.

---

## Backend Tasks (Laravel)

### 4.1 Teacher Management
- [ ] **B-04-001** — Create `Teacher` model (user_id, employee_number, qualification, school_id)
- [ ] **B-04-002** — Create `TeacherData` DTO
- [ ] **B-04-003** — Create `TeacherController` with CRUD endpoints
- [ ] **B-04-004** — Implement teacher-subject-class assignment service
- [ ] **B-04-005** — Implement teacher listing with Spatie Query Builder filters (department, subject, status)
- [ ] **B-04-006** — Create teacher import endpoint (bulk CSV/Excel upload)
- [ ] **B-04-007** — Create `TeacherPolicy` (school admin only)
- [ ] **B-04-008** — Write Pest tests for teacher management

### 4.2 Student Management
- [ ] **B-04-009** — Create `Student` model (user_id, student_number, date_of_birth, gender, class_id, school_id)
- [ ] **B-04-010** — Create `StudentData` DTO
- [ ] **B-04-011** — Create `StudentController` with CRUD endpoints
- [ ] **B-04-012** — Implement student enrollment (assign to class)
- [ ] **B-04-013** — Implement student promotion/transfer between classes
- [ ] **B-04-014** — Implement student listing with filters (class, grade, gender, status)
- [ ] **B-04-015** — Create student import endpoint (bulk CSV/Excel upload)
- [ ] **B-04-016** — Create `StudentPolicy`
- [ ] **B-04-017** — Write Pest tests for student management

### 4.3 Parent Management
- [ ] **B-04-018** — Create `Guardian` model (user_id, phone, relationship, school_id)
- [ ] **B-04-019** — Create `GuardianData` DTO
- [ ] **B-04-020** — Create `GuardianController` with CRUD endpoints
- [ ] **B-04-021** — Implement parent-student linking (many-to-many: a parent can have multiple children)
- [ ] **B-04-022** — Create `GuardianPolicy`
- [ ] **B-04-023** — Write Pest tests for parent management

### 4.4 HOD Assignment
- [ ] **B-04-024** — Implement HOD role assignment to teacher endpoint
- [ ] **B-04-025** — Link HOD to department (one HOD per department)
- [ ] **B-04-026** — Write Pest tests for HOD assignment

---

## Frontend Tasks (Angular)

### 4.5 Teacher Management UI
- [ ] **F-04-001** — Create `TeacherService` for API integration
- [ ] **F-04-002** — Create teacher listing page with search, filters, pagination
- [ ] **F-04-003** — Create teacher creation/edit form (personal info, qualifications)
- [ ] **F-04-004** — Create teacher detail view (assigned subjects, classes, schedule)
- [ ] **F-04-005** — Create teacher subject-class assignment interface
- [ ] **F-04-006** — Create teacher bulk import page (CSV upload with preview)

### 4.6 Student Management UI
- [ ] **F-04-007** — Create `StudentService` for API integration
- [ ] **F-04-008** — Create student listing page with search, filters, pagination
- [ ] **F-04-009** — Create student registration form (personal info, guardian info)
- [ ] **F-04-010** — Create student detail view (class, subjects, attendance summary)
- [ ] **F-04-011** — Create student class enrollment interface
- [ ] **F-04-012** — Create student promotion/transfer dialog
- [ ] **F-04-013** — Create student bulk import page (CSV upload with preview)

### 4.7 Parent Management UI
- [ ] **F-04-014** — Create `GuardianService` for API integration
- [ ] **F-04-015** — Create parent listing page with search
- [ ] **F-04-016** — Create parent registration form
- [ ] **F-04-017** — Create parent-student linking interface (search and link children)
- [ ] **F-04-018** — Create parent detail view (linked children, contact info)
