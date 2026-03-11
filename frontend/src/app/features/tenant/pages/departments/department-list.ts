import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Edit, Trash2, X, Building2, ChevronDown } from 'lucide-angular';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../../../core/models/school-admin.models';

@Component({
    selector: 'app-department-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school departments and their heads</p>
        </div>
        <button
          (click)="showCreateForm()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new department">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Department
        </button>
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
              {{ editingId() ? 'Edit Department' : 'New Department' }}
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
                <label for="dept-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="dept-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Science Department"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Department name is required</p>
                }
              </div>

              <!-- Description -->
              <div>
                <label for="dept-description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  id="dept-description"
                  type="text"
                  formControlName="description"
                  placeholder="Optional description"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
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
                  {{ editingId() ? 'Update Department' : 'Create Department' }}
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
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading departments">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Departments Table -->
        @if (departments().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="Building2Icon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No departments yet</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Get started by creating your first department.</p>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table class="w-full text-sm" aria-label="Departments table">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Head of Department</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Subjects</th>
                  <th scope="col" class="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (dept of departments(); track dept.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <lucide-icon [img]="Building2Icon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                        </div>
                        <span class="font-medium text-slate-900 dark:text-white">{{ dept.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {{ dept.description || '—' }}
                    </td>
                    <td class="px-4 py-3.5 hidden lg:table-cell">
                      @if (dept.hod) {
                        <span class="text-slate-700 dark:text-slate-300">{{ dept.hod.name }}</span>
                      } @else {
                        <span class="text-slate-400 text-xs">Not assigned</span>
                      }
                    </td>
                    <td class="px-4 py-3.5 hidden lg:table-cell">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {{ dept.subjects_count ?? 0 }} subjects
                      </span>
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="editDepartment(dept)"
                          class="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          [attr.aria-label]="'Edit ' + dept.name">
                          <lucide-icon [img]="EditIcon" [size]="16"></lucide-icon>
                        </button>
                        <button
                          (click)="deleteDepartment(dept)"
                          class="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          [attr.aria-label]="'Delete ' + dept.name">
                          <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
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
              Showing {{ departments().length }} of {{ meta()!.total }} departments
            </p>
          }
        }
      }
    </div>
  `,
})
export class DepartmentList implements OnInit {
    private readonly departmentService = inject(DepartmentService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly Building2Icon = Building2;
    readonly ChevronDownIcon = ChevronDown;

    // State
    readonly departments = signal<Department[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);
    readonly meta = signal<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        description: [''],
        hod_id: [null as number | null],
    });

    ngOnInit(): void {
        this.loadDepartments();
    }

    loadDepartments(): void {
        this.loading.set(true);
        this.error.set(null);
        this.departmentService.getDepartments({ per_page: 50 }).subscribe({
            next: (res) => {
                this.departments.set(res.data);
                this.meta.set(res.meta);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load departments. Please try again.');
                this.loading.set(false);
            },
        });
    }

    showCreateForm(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', description: '', hod_id: null });
        this.showForm.set(true);
        this.error.set(null);
    }

    editDepartment(dept: Department): void {
        this.editingId.set(dept.id);
        this.form.patchValue({
            name: dept.name,
            description: dept.description ?? '',
            hod_id: dept.hod_id,
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
            ? this.departmentService.updateDepartment(id, data)
            : this.departmentService.createDepartment(data);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.editingId.set(null);
                this.form.reset();
                this.successMessage.set(id ? 'Department updated successfully.' : 'Department created successfully.');
                this.loadDepartments();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to save department. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    deleteDepartment(dept: Department): void {
        if (!confirm(`Are you sure you want to delete "${dept.name}"? This action cannot be undone.`)) {
            return;
        }
        this.departmentService.deleteDepartment(dept.id).subscribe({
            next: () => {
                this.successMessage.set('Department deleted successfully.');
                this.loadDepartments();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to delete department. Please try again.');
            },
        });
    }
}
