import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, School, Users, BookMarked, UserCheck } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import { SubjectService } from '../../services/subject.service';
import { DepartmentService } from '../../services/department.service';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SchoolClass, Subject, User as UserModel } from '../../../../core/models/school-admin.models';
import { Student } from '../../models/user-management.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbCombobox, ComboboxOption } from '../../../../shared/components/ui/zb-combobox';

@Component({
    selector: 'app-class-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, RouterLink, ZbButton, ZbModal, ZbCombobox],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Back -->
      <a
        routerLink="/tenant/classes"
        class="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
        <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
        Back to Classes
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading class details">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (schoolClass()) {

        <!-- Page Header -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-14 h-14 rounded-sm bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <lucide-icon [img]="SchoolIcon" [size]="28" class="text-primary-600 dark:text-primary-400"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ schoolClass()!.name }}</h1>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ schoolClass()!.grade_level }}</span>
              @if (schoolClass()!.stream) {
                <span class="text-slate-300 dark:text-slate-600">•</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ schoolClass()!.stream }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-sm bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <lucide-icon [img]="UsersIcon" [size]="20" class="text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Students / Capacity</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ enrolledStudents().length }} / {{ schoolClass()!.capacity }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-sm bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
                <lucide-icon [img]="UserCheckIcon" [size]="20" class="text-accent-600 dark:text-accent-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Class Teacher</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ schoolClass()!.class_teacher?.name ?? 'Not assigned' }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-sm bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <lucide-icon [img]="BookMarkedIcon" [size]="20" class="text-purple-600 dark:text-purple-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Subjects</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ schoolClass()!.subjects?.length ?? 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">

          <!-- Tab Bar -->
          <div class="flex items-center border-b border-slate-200 dark:border-slate-700 px-2" role="tablist">
            <button
              role="tab"
              [attr.aria-selected]="activeTab() === 'teacher'"
              [attr.aria-controls]="'tab-teacher'"
              (click)="activeTab.set('teacher')"
              class="flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              [class]="activeTab() === 'teacher'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
              <lucide-icon [img]="UserCheckIcon" [size]="15"></lucide-icon>
              Class Teacher
            </button>
            <button
              role="tab"
              [attr.aria-selected]="activeTab() === 'students'"
              [attr.aria-controls]="'tab-students'"
              (click)="activeTab.set('students')"
              class="flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              [class]="activeTab() === 'students'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
              <lucide-icon [img]="UsersIcon" [size]="15"></lucide-icon>
              Students
              <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none"
                [class]="activeTab() === 'students'
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">
                {{ enrolledStudents().length }}
              </span>
            </button>
            <button
              role="tab"
              [attr.aria-selected]="activeTab() === 'subjects'"
              [attr.aria-controls]="'tab-subjects'"
              (click)="activeTab.set('subjects')"
              class="flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              [class]="activeTab() === 'subjects'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
              <lucide-icon [img]="BookMarkedIcon" [size]="15"></lucide-icon>
              Subjects
              <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none"
                [class]="activeTab() === 'subjects'
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">
                {{ schoolClass()!.subjects?.length ?? 0 }}
              </span>
            </button>
          </div>

          <!-- Tab: Class Teacher -->
          @if (activeTab() === 'teacher') {
            <div id="tab-teacher" role="tabpanel">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <p class="text-xs text-slate-500 dark:text-slate-400">The teacher responsible for overseeing this class.</p>
                @if (isAdmin()) {
                  <zb-button variant="secondary" size="sm" [iconLeft]="UserCheckIcon" (clicked)="openAssignTeacherModal()">
                    Assign Teacher
                  </zb-button>
                }
              </div>
              <div class="px-6 py-5">
                @if (schoolClass()!.class_teacher) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm shrink-0"
                      aria-hidden="true">
                      {{ schoolClass()!.class_teacher!.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ schoolClass()!.class_teacher!.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ schoolClass()!.class_teacher!.email }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="flex flex-col items-center justify-center py-8 text-center">
                    <lucide-icon [img]="UserCheckIcon" [size]="24" class="text-slate-300 dark:text-slate-600 mb-2"></lucide-icon>
                    <p class="text-sm text-slate-500 dark:text-slate-400">No class teacher assigned yet</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tab: Students -->
          @if (activeTab() === 'students') {
            <div id="tab-students" role="tabpanel">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ enrolledStudents().length }} of {{ schoolClass()!.capacity }} seats filled
                </p>
                @if (isAdmin()) {
                  <zb-button
                    variant="primary"
                    size="sm"
                    [disabled]="studentOptions().length === 0"
                    (clicked)="openEnrollModal()">
                    Enroll Student
                  </zb-button>
                }
              </div>
              @if (enrolledStudents().length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <lucide-icon [img]="UsersIcon" [size]="24" class="text-slate-300 dark:text-slate-600 mb-2"></lucide-icon>
                  <p class="text-sm text-slate-500 dark:text-slate-400">No students enrolled yet</p>
                </div>
              } @else {
                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (student of enrolledStudents(); track student.id) {
                    <div class="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0"
                          aria-hidden="true">
                          {{ student.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ student.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ student.email }}</p>
                        </div>
                      </div>
                      @if (isAdmin()) {
                        <zb-button variant="danger" size="sm" (clicked)="unenrollStudent(student)"
                          [attr.aria-label]="'Unenroll ' + student.name">
                          Unenroll
                        </zb-button>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Tab: Subjects -->
          @if (activeTab() === 'subjects') {
            <div id="tab-subjects" role="tabpanel">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <p class="text-xs text-slate-500 dark:text-slate-400">Subjects taught in this class.</p>
                @if (isAdmin()) {
                  <zb-button variant="primary" size="sm" (clicked)="openAddSubjectModal()">
                    Add Subject
                  </zb-button>
                }
              </div>
              @if (!schoolClass()!.subjects || schoolClass()!.subjects!.length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <lucide-icon [img]="BookMarkedIcon" [size]="24" class="text-slate-300 dark:text-slate-600 mb-2"></lucide-icon>
                  <p class="text-sm text-slate-500 dark:text-slate-400">No subjects assigned yet</p>
                </div>
              } @else {
                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (subject of schoolClass()!.subjects!; track subject.id) {
                    <div class="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-sm bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0"
                          aria-hidden="true">
                          <lucide-icon [img]="BookMarkedIcon" [size]="16" class="text-purple-600 dark:text-purple-400"></lucide-icon>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ subject.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ subject.code }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                        @if (subjectTeacher(subject); as teacher) {
                          <div class="hidden sm:flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                              aria-hidden="true">
                              {{ teacher.name.charAt(0).toUpperCase() }}
                            </div>
                            <span class="text-xs text-slate-600 dark:text-slate-400">{{ teacher.name }}</span>
                          </div>
                        } @else {
                          <span class="hidden sm:inline text-xs text-slate-400 dark:text-slate-600 italic">No teacher</span>
                        }
                        @if (isAdmin()) {
                          <zb-button variant="danger" size="sm" (clicked)="removeSubject(subject)"
                            [attr.aria-label]="'Remove ' + subject.name + ' from class'">
                            Remove
                          </zb-button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

        </div>

      } @else {
        <div class="text-center py-12">
          <p class="text-slate-500 dark:text-slate-400">Class not found.</p>
        </div>
      }

      <!-- Assign Teacher Modal -->
      @if (showAssignTeacherModal()) {
        <zb-modal title="Assign Class Teacher" [icon]="UserCheckIcon" size="md" (close)="closeAssignTeacherModal()">
          <div class="px-6 py-5">
            <form [formGroup]="assignTeacherForm" (ngSubmit)="onAssignTeacher()">
              <zb-combobox
                formControlName="teacher_id"
                label="Search teachers"
                placeholder="Type a name or email..."
                [options]="teacherOptions()"
                [required]="true" />
              <div class="flex items-center justify-end gap-2 mt-6">
                <zb-button variant="outline" type="button" (clicked)="closeAssignTeacherModal()">Cancel</zb-button>
                <zb-button variant="primary" type="submit" [loading]="assigningTeacher()" [disabled]="assignTeacherForm.invalid">
                  Assign
                </zb-button>
              </div>
            </form>
          </div>
        </zb-modal>
      }

      <!-- Add Subject Modal -->
      @if (showAddSubjectModal()) {
        <zb-modal title="Add Subject" [icon]="BookMarkedIcon" size="md" (close)="closeAddSubjectModal()">
          <div class="px-6 py-5">
            <form [formGroup]="addSubjectForm" (ngSubmit)="onAddSubject()">
              <zb-combobox
                formControlName="subject_id"
                label="Search subjects"
                placeholder="Type a subject name or code..."
                [options]="subjectOptions()"
                [required]="true" />
              <div class="flex items-center justify-end gap-2 mt-6">
                <zb-button variant="outline" type="button" (clicked)="closeAddSubjectModal()">Cancel</zb-button>
                <zb-button variant="primary" type="submit" [loading]="addingSubject()" [disabled]="addSubjectForm.invalid">
                  Assign
                </zb-button>
              </div>
            </form>
          </div>
        </zb-modal>
      }

      <!-- Enroll Student Modal -->
      @if (showEnrollModal()) {
        <zb-modal title="Enroll Student" [icon]="UsersIcon" size="md" (close)="closeEnrollModal()">
          <div class="px-6 py-5">
            @if (loadingStudents()) {
              <div class="flex items-center justify-center py-8">
                <div class="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            } @else {
              <form [formGroup]="enrollForm" (ngSubmit)="onEnrollStudent()">
                <zb-combobox
                  formControlName="student_id"
                  label="Search students"
                  placeholder="Type a name or student number..."
                  [options]="studentOptions()"
                  [required]="true" />
                <div class="flex items-center justify-end gap-2 mt-6">
                  <zb-button variant="outline" type="button" (clicked)="closeEnrollModal()">Cancel</zb-button>
                  <zb-button variant="primary" type="submit" [loading]="enrolling()" [disabled]="enrollForm.invalid">
                    Enroll
                  </zb-button>
                </div>
              </form>
            }
          </div>
        </zb-modal>
      }
    </div>
  `,
})
export class ClassDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly classService = inject(ClassService);
    private readonly subjectService = inject(SubjectService);
    private readonly departmentService = inject(DepartmentService);
    private readonly studentService = inject(StudentService);
    private readonly authService = inject(AuthService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly ArrowLeftIcon = ArrowLeft;
    readonly SchoolIcon = School;
    readonly UsersIcon = Users;
    readonly BookMarkedIcon = BookMarked;
    readonly UserCheckIcon = UserCheck;

    readonly schoolClass = signal<SchoolClass | null>(null);
    readonly allSubjects = signal<Subject[]>([]);
    readonly teachers = signal<UserModel[]>([]);
    readonly allStudents = signal<Student[]>([]);
    readonly loading = signal(false);
    readonly loadingStudents = signal(false);
    readonly addingSubject = signal(false);
    readonly showAddSubjectModal = signal(false);
    readonly showAssignTeacherModal = signal(false);
    readonly showEnrollModal = signal(false);
    readonly assigningTeacher = signal(false);
    readonly enrolling = signal(false);

    readonly activeTab = signal<'teacher' | 'students' | 'subjects'>('teacher');

    readonly isAdmin = computed(() => ['school_admin', 'hod', 'class_teacher'].includes(this.authService.userRole() ?? ''));

    readonly enrolledStudents = computed(() => this.schoolClass()?.students ?? []);

    readonly teacherMap = computed(() => {
        const map = new Map<number, UserModel>();
        for (const t of this.teachers()) map.set(t.id, t);
        return map;
    });

    readonly teacherOptions = computed<ComboboxOption[]>(() =>
        this.teachers().map(t => ({ value: String(t.id), label: t.name, sublabel: t.email }))
    );

    readonly subjectOptions = computed<ComboboxOption[]>(() => {
        const assignedIds = new Set((this.schoolClass()?.subjects ?? []).map(s => s.id));
        return this.allSubjects()
            .filter(s => !assignedIds.has(s.id))
            .map(s => ({ value: String(s.id), label: s.name, sublabel: s.code ?? undefined }));
    });

    readonly studentOptions = computed<ComboboxOption[]>(() => {
        const enrolledIds = new Set(this.enrolledStudents().map(s => s.id));
        return this.allStudents()
            .filter(s => !enrolledIds.has(s.id))
            .map(s => ({
                value: String(s.id),
                label: s.name,
                sublabel: s.studentProfile?.student_number ?? undefined,
            }));
    });

    readonly addSubjectForm = this.fb.group({
        subject_id: ['', Validators.required],
    });

    readonly assignTeacherForm = this.fb.group({
        teacher_id: ['', Validators.required],
    });

    readonly enrollForm = this.fb.group({
        student_id: ['', Validators.required],
    });

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadClass(id);
            this.loadAllSubjects();
            this.loadTeachers();
            this.loadStudents();
        }
    }

    loadTeachers(): void {
        this.departmentService.getTeachers({ per_page: 100 }).subscribe({
            next: (res) => this.teachers.set(res.data.data),
            error: () => {},
        });
    }

    loadStudents(): void {
        this.loadingStudents.set(true);
        this.studentService.getStudents({ per_page: 200 }).subscribe({
            next: (res) => {
                this.allStudents.set(res.data.data);
                this.loadingStudents.set(false);
            },
            error: () => this.loadingStudents.set(false),
        });
    }

    loadClass(id: number): void {
        this.loading.set(true);
        this.classService.getClass(id).subscribe({
            next: (res) => {
                this.schoolClass.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load class details.');
                this.loading.set(false);
            },
        });
    }

    loadAllSubjects(): void {
        this.subjectService.getSubjects({ per_page: 200 }).subscribe({
            next: (res) => this.allSubjects.set(res.data.data),
            error: () => {},
        });
    }

    openAssignTeacherModal(): void {
        this.assignTeacherForm.reset({ teacher_id: '' });
        this.showAssignTeacherModal.set(true);
    }

    closeAssignTeacherModal(): void {
        this.showAssignTeacherModal.set(false);
        this.assignTeacherForm.reset({ teacher_id: '' });
    }

    onAssignTeacher(): void {
        if (this.assignTeacherForm.invalid) return;
        const cls = this.schoolClass();
        if (!cls) return;
        const teacherId = Number(this.assignTeacherForm.value.teacher_id);
        if (!teacherId) return;

        this.assigningTeacher.set(true);
        this.classService.assignTeacher(cls.id, teacherId).subscribe({
            next: (res) => {
                this.schoolClass.set(res.data);
                this.assigningTeacher.set(false);
                this.closeAssignTeacherModal();
                this.toast.success('Class teacher assigned successfully.');
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to assign class teacher.');
                this.assigningTeacher.set(false);
            },
        });
    }

    openAddSubjectModal(): void {
        this.addSubjectForm.reset({ subject_id: '' });
        this.showAddSubjectModal.set(true);
    }

    closeAddSubjectModal(): void {
        this.showAddSubjectModal.set(false);
        this.addSubjectForm.reset({ subject_id: '' });
    }

    onAddSubject(): void {
        if (this.addSubjectForm.invalid) return;
        const cls = this.schoolClass();
        if (!cls) return;
        const subjectId = Number(this.addSubjectForm.value.subject_id);
        if (!subjectId) return;

        this.addingSubject.set(true);
        this.classService.assignSubject(cls.id, subjectId).subscribe({
            next: () => {
                this.addingSubject.set(false);
                this.closeAddSubjectModal();
                this.toast.success('Subject assigned successfully.');
                this.loadClass(cls.id);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to assign subject.');
                this.addingSubject.set(false);
            },
        });
    }

    openEnrollModal(): void {
        this.enrollForm.reset({ student_id: '' });
        this.showEnrollModal.set(true);
    }

    closeEnrollModal(): void {
        this.showEnrollModal.set(false);
        this.enrollForm.reset({ student_id: '' });
    }

    onEnrollStudent(): void {
        if (this.enrollForm.invalid) return;
        const cls = this.schoolClass();
        if (!cls) return;
        const studentId = Number(this.enrollForm.value.student_id);
        if (!studentId) return;

        this.enrolling.set(true);
        this.classService.enrollStudent(cls.id, studentId).subscribe({
            next: () => {
                this.enrolling.set(false);
                this.closeEnrollModal();
                this.toast.success('Student enrolled successfully.');
                this.loadClass(cls.id);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to enroll student.');
                this.enrolling.set(false);
            },
        });
    }

    async unenrollStudent(student: UserModel): Promise<void> {
        const cls = this.schoolClass();
        if (!cls) return;
        const confirmed = await this.alertService.confirm({
            title: 'Unenroll Student',
            message: `Remove "${student.name}" from this class?`,
            confirmText: 'Unenroll',
            type: 'danger',
        });
        if (!confirmed) return;

        this.classService.unenrollStudent(cls.id, student.id).subscribe({
            next: () => {
                this.toast.success('Student unenrolled successfully.');
                this.loadClass(cls.id);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to unenroll student.');
            },
        });
    }

    subjectTeacher(subject: Subject): UserModel | null {
        const id = subject.pivot?.teacher_id;
        return id != null ? (this.teacherMap().get(id) ?? null) : null;
    }

    async removeSubject(subject: Subject): Promise<void> {
        const cls = this.schoolClass();
        if (!cls) return;
        const confirmed = await this.alertService.confirm({
            title: 'Remove Subject',
            message: `Remove "${subject.name}" from this class?`,
            confirmText: 'Remove',
            type: 'danger',
        });
        if (!confirmed) return;

        this.classService.removeSubject(cls.id, subject.id).subscribe({
            next: () => {
                this.toast.success('Subject removed successfully.');
                this.loadClass(cls.id);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to remove subject.');
            },
        });
    }
}
