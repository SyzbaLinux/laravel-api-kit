import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, X, GraduationCap, ToggleLeft, ToggleRight, Eye, Upload } from 'lucide-angular';
import { StudentService, CreateStudentPayload } from '../../services/student.service';
import { Student } from '../../models/user-management.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
] as const;

@Component({
    selector: 'app-student-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, RouterLink],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage student records and enrolment</p>
        </div>
        <button
          (click)="showCreateForm()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new student">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Student
        </button>
        <a
          routerLink="/tenant/students/import"
          class="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          aria-label="Import students from CSV">
          <lucide-icon [img]="UploadIcon" [size]="16"></lucide-icon>
          Import CSV
        </a>
      </div>

      <!-- Inline Form -->
      @if (showForm()) {
        <div class="mb-6 bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">
              {{ editingId() ? 'Edit Student' : 'New Student' }}
            </h2>
            <button
              (click)="cancelForm()"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label for="student-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Jane Doe"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Full name is required</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label for="student-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span class="text-red-500">*</span>
                </label>
                <input
                  id="student-email"
                  type="email"
                  formControlName="email"
                  placeholder="student@school.edu"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched">
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Email is required</p>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Please enter a valid email</p>
                }
              </div>

              <!-- Password (create only) -->
              @if (!editingId()) {
                <div>
                  <label for="student-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="student-password"
                    type="password"
                    formControlName="password"
                    placeholder="Min. 8 characters"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched">
                  @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                    <p class="mt-1 text-xs text-red-600 dark:text-red-400">Minimum 8 characters</p>
                  }
                </div>
              }

              <!-- Phone -->
              <div>
                <label for="student-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  formControlName="phone"
                  placeholder="+263 77 123 4567"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Student Number -->
              <div>
                <label for="student-number" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student Number
                </label>
                <input
                  id="student-number"
                  type="text"
                  formControlName="student_number"
                  placeholder="e.g. STU-001"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Date of Birth -->
              <div>
                <label for="student-dob" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  id="student-dob"
                  type="date"
                  formControlName="date_of_birth"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Gender -->
              <div>
                <label for="student-gender" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  id="student-gender"
                  formControlName="gender"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option value="">— Select gender —</option>
                  @for (opt of genderOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>

              <!-- Admission Date -->
              <div>
                <label for="student-admission" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Admission Date
                </label>
                <input
                  id="student-admission"
                  type="date"
                  formControlName="admission_date"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                @if (submitting()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                } @else {
                  {{ editingId() ? 'Update Student' : 'Create Student' }}
                }
              </button>
              <button
                type="button"
                (click)="cancelForm()"
                class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading students">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        @if (students().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="GraduationCapIcon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No students yet</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Get started by enrolling your first student.</p>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table class="w-full text-sm" aria-label="Students table">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Student #</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">DOB</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Gender</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" class="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (student of students(); track student.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center flex-shrink-0">
                          <span class="text-white text-xs font-bold">{{ student.name.charAt(0).toUpperCase() }}</span>
                        </div>
                        <span class="font-medium text-slate-900 dark:text-white">{{ student.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {{ student.email }}
                    </td>
                    <td class="px-4 py-3.5 hidden md:table-cell">
                      <span class="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {{ student.studentProfile?.student_number || '—' }}
                      </span>
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                      {{ student.studentProfile?.date_of_birth || '—' }}
                    </td>
                    <td class="px-4 py-3.5 hidden lg:table-cell">
                      @if (student.studentProfile?.gender) {
                        <span class="capitalize text-slate-600 dark:text-slate-300 text-xs">{{ student.studentProfile!.gender }}</span>
                      } @else {
                        <span class="text-slate-400 text-xs">—</span>
                      }
                    </td>
                    <td class="px-4 py-3.5">
                      @if (student.is_active) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                          <lucide-icon [img]="ToggleRightIcon" [size]="14"></lucide-icon>
                          Active
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <lucide-icon [img]="ToggleLeftIcon" [size]="14"></lucide-icon>
                          Inactive
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center justify-end gap-2 flex-wrap">
                        <a
                          [routerLink]="['/tenant/students', student.id]"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          [attr.aria-label]="'View ' + student.name">
                          <lucide-icon [img]="EyeIcon" [size]="13"></lucide-icon>
                          View
                        </a>
                        <button
                          (click)="editStudent(student)"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          [attr.aria-label]="'Edit ' + student.name">
                          <lucide-icon [img]="EditIcon" [size]="13"></lucide-icon>
                          Edit
                        </button>
                        <button
                          (click)="deleteStudent(student)"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          [attr.aria-label]="'Delete ' + student.name">
                          <lucide-icon [img]="TrashIcon" [size]="13"></lucide-icon>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination info -->
          @if (meta()) {
            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400 text-right">
              Showing {{ students().length }} of {{ meta()!.total }} students
            </p>
          }
        }
      }
    </div>
  `,
})
export class StudentList implements OnInit {
    private readonly studentService = inject(StudentService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    // Icons
    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly GraduationCapIcon = GraduationCap;
    readonly ToggleLeftIcon = ToggleLeft;
    readonly ToggleRightIcon = ToggleRight;
    readonly UploadIcon = Upload;
    readonly EyeIcon = Eye;

    readonly genderOptions = GENDER_OPTIONS;

    // State
    readonly students = signal<Student[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly meta = signal<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.minLength(8)]],
        phone: [''],
        student_number: [''],
        date_of_birth: [''],
        gender: [''],
        admission_date: [''],
    });

    ngOnInit(): void {
        this.loadStudents();
    }

    loadStudents(): void {
        this.loading.set(true);
        this.studentService.getStudents({ per_page: 50 }).subscribe({
            next: (res) => {
                this.students.set(res.data.data);
                this.meta.set({
                    current_page: res.data.current_page,
                    last_page: res.data.last_page,
                    per_page: res.data.per_page,
                    total: res.data.total,
                });
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load students. Please try again.');
                this.loading.set(false);
            },
        });
    }

    showCreateForm(): void {
        this.editingId.set(null);
        this.form.reset();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
        this.showForm.set(true);
    }

    editStudent(student: Student): void {
        this.editingId.set(student.id);
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.form.patchValue({
            name: student.name,
            email: student.email,
            phone: student.phone ?? '',
            student_number: student.studentProfile?.student_number ?? '',
            date_of_birth: student.studentProfile?.date_of_birth ?? '',
            gender: student.studentProfile?.gender ?? '',
            admission_date: student.studentProfile?.admission_date ?? '',
        });
        this.showForm.set(true);
    }

    cancelForm(): void {
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);

        const values = this.form.getRawValue();
        const id = this.editingId();

        const payload: CreateStudentPayload = {
            name: values.name!,
            email: values.email!,
            phone: values.phone || undefined,
            student_number: values.student_number || undefined,
            date_of_birth: values.date_of_birth || undefined,
            gender: values.gender || undefined,
            admission_date: values.admission_date || undefined,
        };

        if (values.password) {
            payload.password = values.password;
        }

        const request = id
            ? this.studentService.updateStudent(id, payload)
            : this.studentService.createStudent(payload);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.editingId.set(null);
                this.form.reset();
                this.toast.success(id ? 'Student updated successfully.' : 'Student created successfully.');
                this.loadStudents();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save student. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    async deleteStudent(student: Student): Promise<void> {
        const confirmed = await this.alertService.confirm({ title: 'Confirm', message: `Are you sure you want to delete "${student.name}"? This action cannot be undone.`, confirmText: 'Delete', type: 'danger' });
        if (!confirmed) return;

        this.studentService.deleteStudent(student.id).subscribe({
            next: () => {
                this.toast.success('Student deleted successfully.');
                this.loadStudents();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete student.');
            },
        });
    }
}
