import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, User, Phone, Mail, Calendar, GraduationCap, CheckCircle, XCircle, BookOpen } from 'lucide-angular';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/user-management.models';

@Component({
    selector: 'app-student-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule, ReactiveFormsModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/tenant/students"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to students list">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to Students
        </a>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20" role="status" aria-label="Loading student details">
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
      @if (!loading() && !error() && student()) {
        <div class="space-y-6">
          <!-- Page title -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ student()!.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Student Profile</p>
          </div>

          <!-- Profile Card -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="flex items-start gap-5">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xl font-bold">{{ student()!.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ student()!.name }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Student</p>
                @if (student()!.is_active) {
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
                  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ student()!.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="PhoneIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ student()!.phone || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Profile Card -->
          @if (student()!.studentProfile) {
            <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Student Details</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="GraduationCapIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Student Number</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white font-mono">
                      {{ student()!.studentProfile!.student_number || '—' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CalendarIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Date of Birth</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ student()!.studentProfile!.date_of_birth || '—' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="UserIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white capitalize">
                      {{ student()!.studentProfile!.gender || '—' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CalendarIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Admission Date</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ student()!.studentProfile!.admission_date || '—' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Class Enrollment Section -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <lucide-icon [img]="BookOpenIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
              Class Enrollment
            </h3>

            <div class="mb-4">
              @if (student()!.studentProfile?.class_id) {
                <p class="text-sm text-slate-700 dark:text-slate-300">
                  Currently enrolled in class ID:
                  <span class="font-mono font-semibold text-slate-900 dark:text-white">{{ student()!.studentProfile!.class_id }}</span>
                </p>
              } @else {
                <p class="text-sm text-slate-500 dark:text-slate-400 italic">Not enrolled in any class.</p>
              }
            </div>

            <!-- Enroll Form -->
            @if (enrollSuccess()) {
              <div class="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-sm text-sm text-green-700 dark:text-green-300" role="status">
                {{ enrollSuccess() }}
              </div>
            }
            @if (enrollError()) {
              <div class="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
                {{ enrollError() }}
              </div>
            }

            <form [formGroup]="enrollForm" (ngSubmit)="onEnroll()" class="flex items-end gap-3 flex-wrap">
              <div class="flex-1 min-w-[160px]">
                <label for="enroll-class-id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class ID <span class="text-red-500">*</span>
                </label>
                <input
                  id="enroll-class-id"
                  type="number"
                  formControlName="class_id"
                  placeholder="Enter class ID"
                  min="1"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="enrollForm.get('class_id')?.invalid && enrollForm.get('class_id')?.touched">
              </div>

              <button
                type="submit"
                [disabled]="enrollForm.invalid || enrolling()"
                class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2">
                @if (enrolling()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Enrolling...
                } @else {
                  Enroll in Class
                }
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class StudentDetail implements OnInit {
    private readonly studentService = inject(StudentService);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly UserIcon = User;
    readonly PhoneIcon = Phone;
    readonly MailIcon = Mail;
    readonly CalendarIcon = Calendar;
    readonly GraduationCapIcon = GraduationCap;
    readonly CheckCircleIcon = CheckCircle;
    readonly XCircleIcon = XCircle;
    readonly BookOpenIcon = BookOpen;

    // State
    readonly student = signal<Student | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly enrolling = signal(false);
    readonly enrollError = signal<string | null>(null);
    readonly enrollSuccess = signal<string | null>(null);

    readonly enrollForm = this.fb.group({
        class_id: [null as number | null, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Student ID not found.');
            return;
        }
        this.loadStudent(Number(id));
    }

    private loadStudent(id: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.studentService.getStudent(id).subscribe({
            next: (res) => {
                this.student.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load student details.');
                this.loading.set(false);
            },
        });
    }

    onEnroll(): void {
        if (this.enrollForm.invalid) {
            this.enrollForm.markAllAsTouched();
            return;
        }

        const studentId = this.student()?.id;
        const classId = this.enrollForm.getRawValue().class_id;

        if (!studentId || !classId) return;

        this.enrolling.set(true);
        this.enrollError.set(null);
        this.enrollSuccess.set(null);

        this.studentService.enrollStudent(studentId, classId).subscribe({
            next: () => {
                this.enrolling.set(false);
                this.enrollSuccess.set('Student enrolled successfully.');
                this.enrollForm.reset();
                this.loadStudent(studentId);
                setTimeout(() => this.enrollSuccess.set(null), 4000);
            },
            error: (err) => {
                this.enrollError.set(err?.error?.message ?? 'Failed to enroll student.');
                this.enrolling.set(false);
            },
        });
    }
}
