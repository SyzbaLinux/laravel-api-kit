# Module 11 — Practice Exams & Quizzes

> Teachers create practice tests with various question types; students take them for revision.

---

## Backend Tasks (Laravel)

### 11.1 Quiz Management
- [ ] **B-11-001** — Create `Quiz` model (title, subject_id, class_id, teacher_id, term_id, duration_minutes, total_marks, is_graded, contributes_to_ca, school_id)
- [ ] **B-11-002** — Create `QuizData` DTO
- [ ] **B-11-003** — Create `QuizController` with CRUD endpoints
- [ ] **B-11-004** — API routes with filters (subject, class, term, status)
- [ ] **B-11-005** — Create `QuizPolicy` (teachers manage their own quizzes)
- [ ] **B-11-006** — Write Pest tests

### 11.2 Question Management
- [ ] **B-11-007** — Create `Question` model (quiz_id, type, content, marks, order)
- [ ] **B-11-008** — Question types: `multiple_choice`, `true_false`, `short_answer`
- [ ] **B-11-009** — Create `QuestionOption` model (question_id, content, is_correct) — for MCQ/TF
- [ ] **B-11-010** — Create `QuestionData` DTO
- [ ] **B-11-011** — Create `QuestionController` for CRUD within a quiz
- [ ] **B-11-012** — Implement question reordering endpoint
- [ ] **B-11-013** — Write Pest tests

### 11.3 Quiz Attempt & Auto-Grading
- [ ] **B-11-014** — Create `QuizAttempt` model (quiz_id, student_id, started_at, completed_at, score, school_id)
- [ ] **B-11-015** — Create `QuizAnswer` model (attempt_id, question_id, selected_option_id, text_answer)
- [ ] **B-11-016** — Create `QuizAttemptController` with start/submit endpoints
- [ ] **B-11-017** — Implement auto-grading service for MCQ and true/false questions
- [ ] **B-11-018** — Manual grading endpoint for short answer questions
- [ ] **B-11-019** — Enforce time limit (reject submissions after duration expires)
- [ ] **B-11-020** — Prevent multiple attempts (configurable per quiz)
- [ ] **B-11-021** — Optionally contribute quiz score to continuous assessment
- [ ] **B-11-022** — Write Pest tests

---

## Frontend Tasks (Angular)

### 11.4 Quiz Management UI (Teacher)
- [ ] **F-11-001** — Create `QuizService` for API integration
- [ ] **F-11-002** — Create quiz listing page with filters
- [ ] **F-11-003** — Create quiz creation form (title, subject, class, duration, settings)
- [ ] **F-11-004** — Create question builder interface (add MCQ, true/false, short answer)
- [ ] **F-11-005** — For MCQ: add options with correct answer selector
- [ ] **F-11-006** — Implement question reordering (drag-and-drop)
- [ ] **F-11-007** — Create quiz preview (take quiz as a test run)

### 11.5 Quiz Taking UI (Student)
- [ ] **F-11-008** — Create quiz listing page for students (available quizzes, completed quizzes)
- [ ] **F-11-009** — Create quiz taking interface (question-by-question or all-at-once)
- [ ] **F-11-010** — Display countdown timer
- [ ] **F-11-011** — Implement answer selection/input per question type
- [ ] **F-11-012** — Create submission confirmation dialog
- [ ] **F-11-013** — Create quiz result review page (show correct answers, score breakdown)

### 11.6 Quiz Analytics UI (Teacher)
- [ ] **F-11-014** — Create quiz results overview (student scores, class average)
- [ ] **F-11-015** — Create per-question analytics (success rate per question)
- [ ] **F-11-016** — Create manual grading interface for short answer questions
