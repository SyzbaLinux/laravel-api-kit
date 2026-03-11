# Module 13 — Notifications & Communication

> Announcements, notifications, and communication between schools, teachers, students, and parents.

---

## Backend Tasks (Laravel)

### 13.1 Notification System
- [ ] **B-13-001** — Create `Notification` model (title, body, type, target_role, target_user_id, school_id, read_at)
- [ ] **B-13-002** — Notification types: `announcement`, `assignment`, `report_card`, `attendance`, `system`
- [ ] **B-13-003** — Create `NotificationData` DTO
- [ ] **B-13-004** — Create `NotificationController` with list/read/delete endpoints
- [ ] **B-13-005** — Create endpoint to mark notification as read / mark all as read
- [ ] **B-13-006** — Create unread notification count endpoint
- [ ] **B-13-007** — Write Pest tests

### 13.2 Announcement System
- [ ] **B-13-008** — Create `Announcement` model (title, body, author_id, target_audience, class_id, school_id, published_at)
- [ ] **B-13-009** — Target audiences: `all`, `teachers`, `students`, `parents`, `specific_class`
- [ ] **B-13-010** — Create `AnnouncementData` DTO
- [ ] **B-13-011** — Create `AnnouncementController` with CRUD
- [ ] **B-13-012** — Implement announcement publishing (trigger notification creation for target audience)
- [ ] **B-13-013** — Create `AnnouncementPolicy` (school admin, teachers)
- [ ] **B-13-014** — Write Pest tests

### 13.3 Event-Driven Notifications
- [ ] **B-13-015** — Create notification dispatchers for key events:
  - Assignment created → notify relevant students
  - Report card published → notify students and parents
  - Attendance marked absent → notify parent
  - Quiz available → notify students
- [ ] **B-13-016** — Implement Laravel event/listener architecture for notification triggers
- [ ] **B-13-017** — Write Pest tests

---

## Frontend Tasks (Angular)

### 13.4 Notification UI
- [ ] **F-13-001** — Create `NotificationService` for API integration
- [ ] **F-13-002** — Create notification bell icon with unread count badge
- [ ] **F-13-003** — Create notification dropdown panel (list recent notifications)
- [ ] **F-13-004** — Create notification listing page (all notifications, read/unread filter)
- [ ] **F-13-005** — Implement click-to-navigate (clicking notification goes to relevant page)
- [ ] **F-13-006** — Implement "mark all as read" action

### 13.5 Announcement UI
- [ ] **F-13-007** — Create `AnnouncementService` for API integration
- [ ] **F-13-008** — Create announcement listing page (for viewing)
- [ ] **F-13-009** — Create announcement creation form (title, body, audience selector)
- [ ] **F-13-010** — Create announcement detail view
- [ ] **F-13-011** — Display announcements on portal dashboards as cards/banners
