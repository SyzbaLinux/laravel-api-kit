# Module 10 — Learning Content & E-Learning

> Teachers upload recorded lessons, documents, and materials for student access.

---

## Backend Tasks (Laravel)

### 10.1 Learning Material Management
- [ ] **B-10-001** — Create `LearningMaterial` model (title, description, subject_id, class_id, teacher_id, type, file_path, url, term_id, school_id)
- [ ] **B-10-002** — Material types: `video`, `audio`, `document`, `presentation`, `link`
- [ ] **B-10-003** — Create `LearningMaterialData` DTO
- [ ] **B-10-004** — Create `LearningMaterialController` with CRUD endpoints
- [ ] **B-10-005** — Implement file upload service (support large files — videos, PDFs, slides)
- [ ] **B-10-006** — Implement cloud storage integration (S3/compatible) for media files
- [ ] **B-10-007** — API routes with Spatie Query Builder filters (subject, class, type, term)
- [ ] **B-10-008** — Create `LearningMaterialPolicy` (teachers upload for their subjects/classes)
- [ ] **B-10-009** — Write Pest tests

### 10.2 Recorded Lessons
- [ ] **B-10-010** — Create `RecordedLesson` model (title, subject_id, class_id, teacher_id, video_url, duration, description, term_id, school_id)
- [ ] **B-10-011** — Create `RecordedLessonData` DTO
- [ ] **B-10-012** — Create `RecordedLessonController` with CRUD
- [ ] **B-10-013** — Implement video upload/streaming URL generation
- [ ] **B-10-014** — Track lesson view count
- [ ] **B-10-015** — Write Pest tests

### 10.3 Content Organization
- [ ] **B-10-016** — Implement content categorization by subject and topic
- [ ] **B-10-017** — Create content search endpoint (full-text search on title, description)
- [ ] **B-10-018** — Write Pest tests

---

## Frontend Tasks (Angular)

### 10.4 Learning Material UI (Teacher)
- [ ] **F-10-001** — Create `LearningMaterialService` for API integration
- [ ] **F-10-002** — Create material listing page with filters (subject, class, type)
- [ ] **F-10-003** — Create material upload form (title, description, type selector, file upload)
- [ ] **F-10-004** — Create material detail view with file preview
- [ ] **F-10-005** — Support drag-and-drop file upload

### 10.5 Recorded Lesson UI (Teacher)
- [ ] **F-10-006** — Create `RecordedLessonService` for API integration
- [ ] **F-10-007** — Create lesson listing page with filters
- [ ] **F-10-008** — Create lesson upload form (video upload + metadata)
- [ ] **F-10-009** — Display upload progress for large video files

### 10.6 Learning Content UI (Student)
- [ ] **F-10-010** — Create student learning library page (browse by subject)
- [ ] **F-10-011** — Create video player component for recorded lessons
- [ ] **F-10-012** — Create document viewer component (PDFs, slides)
- [ ] **F-10-013** — Create content search with filters
- [ ] **F-10-014** — Display recently accessed materials
