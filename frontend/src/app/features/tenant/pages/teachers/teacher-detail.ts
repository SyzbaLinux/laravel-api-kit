import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ArrowLeft, User, Phone, Mail, Briefcase, GraduationCap, Calendar, CheckCircle, XCircle, BookOpen, School, Plus, Trash2 } from 'lucide-angular';
import { TeacherService } from '../../services/teacher.service';
import { Teacher } from '../../models/user-management.models';
import { SchoolClass, Subject } from '../../../../core/models/school-admin.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-teacher-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, ZbButton],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/tenant/teachers"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to teachers list">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to Teachers
        </a>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20" role="status" aria-label="Loading teacher details">
          <div class="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error() && teacher()) {
        <div class="space-y-6">
          <!-- Page title -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ teacher()!.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Teacher Profile</p>
          </div>

          <!-- Profile Card -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="flex items-start gap-5">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xl font-bold">{{ teacher()!.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ teacher()!.name }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 capitalize">{{ teacher()!.role?.display_name ?? teacher()!.role?.name ?? 'Teacher' }}</p>
                @if (teacher()!.is_active) {
                  <span class="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                    <lucide-icon [img]="CheckCircleIcon" [size]="12"></lucide-icon>
                    Active
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <lucide-icon [img]="XCircleIcon" [size]="12"></lucide-icon>
                    Inactive
                  </span>
                }
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="MailIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ teacher()!.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="PhoneIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ teacher()!.phone || '—' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="UserIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Role</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white capitalize">{{ teacher()!.role?.display_name ?? teacher()!.role?.name ?? '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Professional Details -->
          @if (teacher()!.teacherProfile) {
            <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Professional Details</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="BriefcaseIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Employee Number</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white font-mono">{{ teacher()!.teacherProfile!.employee_number || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="GraduationCapIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Qualification</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ teacher()!.teacherProfile!.qualification || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="BriefcaseIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Specialization</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ teacher()!.teacherProfile!.specialization || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CalendarIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Join Date</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ teacher()!.teacherProfile!.join_date || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Profile Status</p>
                    @if (teacher()!.teacherProfile!.is_active) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">Active</span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Inactive</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Class & Subject Assignments -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Class & Subject Assignments</h3>
              <button
                (click)="toggleAssignForm()"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-xs font-medium"
                aria-label="Assign to a class and subject">
                <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                Assign
              </button>
            </div>

            <!-- Assign form -->
            @if (showAssignForm()) {
              <div class="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-slate-200 dark:border-slate-700">
                <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Assign to Class & Subject</h4>
                <form [formGroup]="assignForm" (ngSubmit)="onAssign()" class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label for="assign-class" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class <span class="text-red-500">*</span></label>
                    <select
                      id="assign-class"
                      formControlName="class_id"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">— Select class —</option>
                      @for (cls of availableClasses(); track cls.id) {
                        <option [value]="cls.id">{{ cls.name }} ({{ cls.grade_level }})</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label for="assign-subject" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject <span class="text-red-500">*</span></label>
                    <select
                      id="assign-subject"
                      formControlName="subject_id"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">— Select subject —</option>
                      @for (sub of availableSubjects(); track sub.id) {
                        <option [value]="sub.id">{{ sub.name }} ({{ sub.code }})</option>
                      }
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      [disabled]="assignForm.invalid || assigning()"
                      class="flex-1 px-3 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 text-sm font-medium transition-colors">
                      @if (assigning()) { Saving... } @else { Assign }
                    </button>
                    <button
                      type="button"
                      (click)="toggleAssignForm()"
                      class="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
                @if (assignError()) {
                  <p class="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">{{ assignError() }}</p>
                }
                @if (assignSuccess()) {
                  <p class="mt-2 text-xs text-green-600 dark:text-green-400" role="status">{{ assignSuccess() }}</p>
                }
              </div>
            }

            <!-- Assignments list -->
            @if (loadingAssignments()) {
              <div class="flex items-center justify-center py-8" role="status" aria-label="Loading assignments">
                <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            } @else if (assignments().length === 0) {
              <div class="text-center py-8">
                <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mx-auto mb-3">
                  <lucide-icon [img]="BookOpenIcon" [size]="22" class="text-slate-400"></lucide-icon>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400">No subject assignments yet.</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Assign this teacher to a class and subject using the button above.</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (cls of assignments(); track cls.id) {
                  @for (sub of cls.subjects ?? []; track sub.id) {
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-slate-100 dark:border-slate-700">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-sm bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <lucide-icon [img]="SchoolIcon" [size]="15" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ cls.name }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ sub.name }} &middot; {{ sub.code }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs text-slate-400 hidden sm:block">{{ cls.grade_level }}</span>
                        <zb-button
                          variant="danger"
                          size="sm"
                          [loading]="unassigning()"
                          (clicked)="onUnassign(cls, sub)"
                          [attr.aria-label]="'Remove from ' + cls.name + ' – ' + sub.name">
                          Remove
                        </zb-button>
                      </div>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TeacherDetail implements OnInit {
    private readonly teacherService = inject(TeacherService);
    private readonly http = inject(HttpClient);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly UserIcon = User;
    readonly PhoneIcon = Phone;
    readonly MailIcon = Mail;
    readonly BriefcaseIcon = Briefcase;
    readonly GraduationCapIcon = GraduationCap;
    readonly CalendarIcon = Calendar;
    readonly CheckCircleIcon = CheckCircle;
    readonly XCircleIcon = XCircle;
    readonly BookOpenIcon = BookOpen;
    readonly SchoolIcon = School;
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;

    // State
    readonly teacher = signal<Teacher | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly assignments = signal<SchoolClass[]>([]);
    readonly loadingAssignments = signal(false);
    readonly availableClasses = signal<SchoolClass[]>([]);
    readonly availableSubjects = signal<Subject[]>([]);
    readonly showAssignForm = signal(false);
    readonly assigning = signal(false);
    readonly unassigning = signal(false);
    readonly assignError = signal<string | null>(null);
    readonly assignSuccess = signal<string | null>(null);

    readonly assignForm = this.fb.group({
        class_id: ['', Validators.required],
        subject_id: ['', Validators.required],
    });

    private teacherId = 0;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Teacher ID not found.');
            return;
        }
        this.teacherId = Number(id);
        this.loadTeacher(this.teacherId);
        this.loadAssignments(this.teacherId);
        this.loadClassesAndSubjects();
    }

    private loadTeacher(id: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.teacherService.getTeacher(id).subscribe({
            next: (res) => {
                this.teacher.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load teacher details.');
                this.loading.set(false);
            },
        });
    }

    private loadAssignments(teacherId: number): void {
        this.loadingAssignments.set(true);
        this.teacherService.getTeacherAssignments(teacherId).subscribe({
            next: (res) => {
                this.assignments.set(res.data);
                this.loadingAssignments.set(false);
            },
            error: () => this.loadingAssignments.set(false),
        });
    }

    private loadClassesAndSubjects(): void {
        this.http.get<{ data: SchoolClass[] }>(`${environment.apiUrl}/classes?per_page=100`).subscribe({
            next: (res) => {
                const classes = Array.isArray(res.data) ? res.data : (res.data as unknown as { data: SchoolClass[] }).data ?? [];
                this.availableClasses.set(classes);
            },
            error: () => {},
        });
        this.http.get<{ data: Subject[] }>(`${environment.apiUrl}/subjects?per_page=200`).subscribe({
            next: (res) => {
                const subjects = Array.isArray(res.data) ? res.data : (res.data as unknown as { data: Subject[] }).data ?? [];
                this.availableSubjects.set(subjects);
            },
            error: () => {},
        });
    }

    toggleAssignForm(): void {
        this.showAssignForm.update(v => !v);
        this.assignForm.reset();
        this.assignError.set(null);
        this.assignSuccess.set(null);
    }

    async onUnassign(cls: SchoolClass, sub: Subject): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Remove Assignment',
            message: `Remove this teacher from "${sub.name}" in ${cls.name}?`,
            confirmText: 'Remove',
            type: 'danger',
        });
        if (!confirmed) return;

        this.unassigning.set(true);
        this.teacherService.unassignTeacherFromSubjectInClass(cls.id, sub.id).subscribe({
            next: () => {
                this.unassigning.set(false);
                this.toast.success('Teacher removed from assignment.');
                this.loadAssignments(this.teacherId);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to remove assignment.');
                this.unassigning.set(false);
            },
        });
    }

    onAssign(): void {
        if (this.assignForm.invalid) {
            this.assignForm.markAllAsTouched();
            return;
        }

        this.assigning.set(true);
        this.assignError.set(null);
        this.assignSuccess.set(null);

        const { class_id, subject_id } = this.assignForm.getRawValue();

        this.teacherService.assignTeacherToSubjectInClass(Number(class_id), Number(subject_id), this.teacherId).subscribe({
            next: () => {
                this.assigning.set(false);
                this.assignSuccess.set('Teacher assigned successfully.');
                this.assignForm.reset();
                this.loadAssignments(this.teacherId);
                setTimeout(() => this.assignSuccess.set(null), 3000);
            },
            error: (err) => {
                this.assignError.set(err?.error?.message ?? 'Failed to assign teacher.');
                this.assigning.set(false);
            },
        });
    }
}
