import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Edit, Trash2, X, BookMarked, ToggleLeft, ToggleRight } from 'lucide-angular';
import { SubjectService } from '../../services/subject.service';
import { DepartmentService } from '../../services/department.service';
import { Subject, Department } from '../../../../core/models/school-admin.models';

const EDUCATION_LEVELS = [
    { value: 'ecd', label: 'ECD' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'all', label: 'All Levels' },
] as const;

@Component({
    selector: 'app-subject-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Subjects</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school subjects across all departments</p>
        </div>
        <button
          (click)="showCreateForm()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new subject">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Subject
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="mb-6 flex items-center gap-3 flex-wrap">
        <label for="level-filter" class="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Level:</label>
        <select
          id="level-filter"
          [value]="levelFilter()"
          (change)="onLevelFilterChange($event)"
          class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
          <option value="">All Levels</option>
          @for (lvl of educationLevels; track lvl.value) {
            <option [value]="lvl.value">{{ lvl.label }}</option>
          }
        </select>
      </div>

      <!-- Error Alert -->
      @if (error()) {
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Success Alert -->
      @if (successMessage()) {
        <div class="mb-4 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300" role="status">
          {{ successMessage() }}
        </div>
      }

      <!-- Inline Form -->
      @if (showForm()) {
        <div class="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">
              {{ editingId() ? 'Edit Subject' : 'New Subject' }}
            </h2>
            <button
              (click)="cancelForm()"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label for="subject-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="subject-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Mathematics"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Subject name is required</p>
                }
              </div>

              <!-- Code -->
              <div>
                <label for="subject-code" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code <span class="text-red-500">*</span>
                </label>
                <input
                  id="subject-code"
                  type="text"
                  formControlName="code"
                  placeholder="e.g. MATH101"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('code')?.invalid && form.get('code')?.touched">
                @if (form.get('code')?.invalid && form.get('code')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Subject code is required</p>
                }
              </div>

              <!-- Department -->
              <div>
                <label for="subject-dept" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  id="subject-dept"
                  formControlName="department_id"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option [ngValue]="null">No Department</option>
                  @for (dept of departments(); track dept.id) {
                    <option [ngValue]="dept.id">{{ dept.name }}</option>
                  }
                </select>
              </div>

              <!-- Education Level -->
              <div>
                <label for="subject-level" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Education Level <span class="text-red-500">*</span>
                </label>
                <select
                  id="subject-level"
                  formControlName="education_level"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  @for (lvl of educationLevels; track lvl.value) {
                    <option [value]="lvl.value">{{ lvl.label }}</option>
                  }
                </select>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label for="subject-desc" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  id="subject-desc"
                  type="text"
                  formControlName="description"
                  placeholder="Optional description"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Active -->
              <div class="md:col-span-2 flex items-center gap-3">
                <input
                  id="subject-active"
                  type="checkbox"
                  formControlName="is_active"
                  class="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500">
                <label for="subject-active" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active Subject
                </label>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                @if (submitting()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                } @else {
                  {{ editingId() ? 'Update Subject' : 'Create Subject' }}
                }
              </button>
              <button
                type="button"
                (click)="cancelForm()"
                class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading subjects">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        @if (subjects().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="BookMarkedIcon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No subjects found</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Create your first subject to get started.</p>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table class="w-full text-sm" aria-label="Subjects table">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Code</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Level</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" class="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (subject of subjects(); track subject.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3.5">
                      <span class="font-medium text-slate-900 dark:text-white">{{ subject.name }}</span>
                    </td>
                    <td class="px-4 py-3.5 hidden sm:table-cell">
                      <span class="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{{ subject.code }}</span>
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {{ subject.department?.name ?? '—' }}
                    </td>
                    <td class="px-4 py-3.5 hidden lg:table-cell">
                      <span [class]="getLevelBadgeClass(subject.education_level)">
                        {{ getLevelLabel(subject.education_level) }}
                      </span>
                    </td>
                    <td class="px-4 py-3.5">
                      <button
                        (click)="toggleActive(subject)"
                        [attr.aria-label]="subject.is_active ? 'Deactivate ' + subject.name : 'Activate ' + subject.name"
                        class="flex items-center gap-1.5 transition-colors">
                        @if (subject.is_active) {
                          <lucide-icon [img]="ToggleRightIcon" [size]="20" class="text-green-500"></lucide-icon>
                          <span class="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                        } @else {
                          <lucide-icon [img]="ToggleLeftIcon" [size]="20" class="text-slate-400"></lucide-icon>
                          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Inactive</span>
                        }
                      </button>
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="editSubject(subject)"
                          class="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          [attr.aria-label]="'Edit ' + subject.name">
                          <lucide-icon [img]="EditIcon" [size]="16"></lucide-icon>
                        </button>
                        <button
                          (click)="deleteSubject(subject)"
                          class="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          [attr.aria-label]="'Delete ' + subject.name">
                          <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
})
export class SubjectList implements OnInit {
    private readonly subjectService = inject(SubjectService);
    private readonly departmentService = inject(DepartmentService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly BookMarkedIcon = BookMarked;
    readonly ToggleLeftIcon = ToggleLeft;
    readonly ToggleRightIcon = ToggleRight;

    readonly educationLevels = EDUCATION_LEVELS;

    // State
    readonly subjects = signal<Subject[]>([]);
    readonly departments = signal<Department[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);
    readonly levelFilter = signal<string>('');

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        code: ['', [Validators.required, Validators.maxLength(50)]],
        description: [''],
        department_id: [null as number | null],
        education_level: ['all', Validators.required],
        is_active: [true],
    });

    ngOnInit(): void {
        this.loadSubjects();
        this.loadDepartments();
    }

    loadSubjects(): void {
        this.loading.set(true);
        this.error.set(null);
        const params: Record<string, unknown> = { per_page: 100 };
        if (this.levelFilter()) {
            params['filter[education_level]'] = this.levelFilter();
        }
        this.subjectService.getSubjects(params).subscribe({
            next: (res) => {
                this.subjects.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load subjects. Please try again.');
                this.loading.set(false);
            },
        });
    }

    loadDepartments(): void {
        this.departmentService.getDepartments({ per_page: 100 }).subscribe({
            next: (res) => this.departments.set(res.data),
            error: () => {},
        });
    }

    onLevelFilterChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.levelFilter.set(target.value);
        this.loadSubjects();
    }

    showCreateForm(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', code: '', description: '', department_id: null, education_level: 'all', is_active: true });
        this.showForm.set(true);
        this.error.set(null);
    }

    editSubject(subject: Subject): void {
        this.editingId.set(subject.id);
        this.form.patchValue({
            name: subject.name,
            code: subject.code,
            description: subject.description ?? '',
            department_id: subject.department_id,
            education_level: subject.education_level,
            is_active: subject.is_active,
        });
        this.showForm.set(true);
        this.error.set(null);
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
        this.error.set(null);

        const data = this.form.value;
        const id = this.editingId();

        const request = id
            ? this.subjectService.updateSubject(id, data)
            : this.subjectService.createSubject(data);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.editingId.set(null);
                this.form.reset();
                this.successMessage.set(id ? 'Subject updated successfully.' : 'Subject created successfully.');
                this.loadSubjects();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to save subject. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    toggleActive(subject: Subject): void {
        this.subjectService.toggleActive(subject.id, !subject.is_active).subscribe({
            next: () => {
                this.subjects.update(list =>
                    list.map(s => s.id === subject.id ? { ...s, is_active: !s.is_active } : s)
                );
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to update subject status.');
            },
        });
    }

    deleteSubject(subject: Subject): void {
        if (!confirm(`Are you sure you want to delete "${subject.name}"?`)) return;
        this.subjectService.deleteSubject(subject.id).subscribe({
            next: () => {
                this.successMessage.set('Subject deleted successfully.');
                this.loadSubjects();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to delete subject.');
            },
        });
    }

    getLevelLabel(level: string): string {
        return EDUCATION_LEVELS.find(l => l.value === level)?.label ?? level;
    }

    getLevelBadgeClass(level: string): string {
        const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ';
        switch (level) {
            case 'ecd': return base + 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'primary': return base + 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'secondary': return base + 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            default: return base + 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    }
}
