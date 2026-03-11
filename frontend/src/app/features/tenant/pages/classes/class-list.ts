import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, X, School, Users, ChevronRight } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import { SchoolClass } from '../../../../core/models/school-admin.models';

@Component({
    selector: 'app-class-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Classes</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school classes and their assignments</p>
        </div>
        <button
          (click)="showCreateForm()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new class">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Class
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
              {{ editingId() ? 'Edit Class' : 'New Class' }}
            </h2>
            <button
              (click)="cancelForm()"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Name -->
              <div>
                <label for="class-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="class-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Form 1A"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Class name is required</p>
                }
              </div>

              <!-- Grade Level -->
              <div>
                <label for="class-grade" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Grade Level <span class="text-red-500">*</span>
                </label>
                <input
                  id="class-grade"
                  type="text"
                  formControlName="grade_level"
                  placeholder="e.g. Form 1"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('grade_level')?.invalid && form.get('grade_level')?.touched">
                @if (form.get('grade_level')?.invalid && form.get('grade_level')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Grade level is required</p>
                }
              </div>

              <!-- Stream -->
              <div>
                <label for="class-stream" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stream
                </label>
                <input
                  id="class-stream"
                  type="text"
                  formControlName="stream"
                  placeholder="e.g. Science, Arts"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Capacity -->
              <div>
                <label for="class-capacity" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Capacity <span class="text-red-500">*</span>
                </label>
                <input
                  id="class-capacity"
                  type="number"
                  formControlName="capacity"
                  min="1"
                  placeholder="e.g. 40"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('capacity')?.invalid && form.get('capacity')?.touched">
                @if (form.get('capacity')?.invalid && form.get('capacity')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Capacity is required and must be positive</p>
                }
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
                  {{ editingId() ? 'Update Class' : 'Create Class' }}
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
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading classes">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        @if (classes().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="SchoolIcon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No classes yet</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Create your first class to get started.</p>
          </div>
        } @else {
          <!-- Grouped by grade level -->
          @for (group of groupedClasses(); track group.gradeLevel) {
            <div class="mb-8">
              <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                {{ group.gradeLevel }}
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (cls of group.classes; track cls.id) {
                  <div
                    class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow transition-all cursor-pointer group"
                    (click)="viewClass(cls)"
                    role="button"
                    tabindex="0"
                    (keydown.enter)="viewClass(cls)"
                    (keydown.space)="viewClass(cls)"
                    [attr.aria-label]="'View details for ' + cls.name">
                    <!-- Card Header -->
                    <div class="flex items-start justify-between mb-3">
                      <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="SchoolIcon" [size]="20" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                      </div>
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          (click)="$event.stopPropagation(); editClass(cls)"
                          class="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          [attr.aria-label]="'Edit ' + cls.name">
                          <lucide-icon [img]="EditIcon" [size]="14"></lucide-icon>
                        </button>
                        <button
                          (click)="$event.stopPropagation(); deleteClass(cls)"
                          class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          [attr.aria-label]="'Delete ' + cls.name">
                          <lucide-icon [img]="TrashIcon" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </div>

                    <!-- Class Name & Stream -->
                    <div class="mb-3">
                      <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ cls.name }}</h3>
                      @if (cls.stream) {
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ cls.stream }}</p>
                      }
                    </div>

                    <!-- Stats -->
                    <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span class="flex items-center gap-1">
                        <lucide-icon [img]="UsersIcon" [size]="12"></lucide-icon>
                        {{ cls.students_count ?? 0 }}/{{ cls.capacity }}
                      </span>
                    </div>

                    @if (cls.classTeacher) {
                      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        Teacher: <span class="text-slate-700 dark:text-slate-300 font-medium">{{ cls.classTeacher.name }}</span>
                      </div>
                    }

                    <!-- View arrow -->
                    <div class="mt-3 flex items-center justify-end text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      View details
                      <lucide-icon [img]="ChevronRightIcon" [size]="14" class="ml-1"></lucide-icon>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      }
    </div>
  `,
})
export class ClassList implements OnInit {
    private readonly classService = inject(ClassService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly SchoolIcon = School;
    readonly UsersIcon = Users;
    readonly ChevronRightIcon = ChevronRight;

    // State
    readonly classes = signal<SchoolClass[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly groupedClasses = computed(() => {
        const map = new Map<string, SchoolClass[]>();
        for (const cls of this.classes()) {
            const existing = map.get(cls.grade_level) ?? [];
            existing.push(cls);
            map.set(cls.grade_level, existing);
        }
        return Array.from(map.entries()).map(([gradeLevel, classes]) => ({ gradeLevel, classes }));
    });

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        grade_level: ['', [Validators.required, Validators.maxLength(100)]],
        stream: [''],
        capacity: [30, [Validators.required, Validators.min(1)]],
        class_teacher_id: [null as number | null],
        academic_year_id: [null as number | null],
    });

    ngOnInit(): void {
        this.loadClasses();
    }

    loadClasses(): void {
        this.loading.set(true);
        this.error.set(null);
        this.classService.getClasses({ per_page: 100 }).subscribe({
            next: (res) => {
                this.classes.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load classes. Please try again.');
                this.loading.set(false);
            },
        });
    }

    showCreateForm(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', grade_level: '', stream: '', capacity: 30, class_teacher_id: null, academic_year_id: null });
        this.showForm.set(true);
        this.error.set(null);
    }

    editClass(cls: SchoolClass): void {
        this.editingId.set(cls.id);
        this.form.patchValue({
            name: cls.name,
            grade_level: cls.grade_level,
            stream: cls.stream ?? '',
            capacity: cls.capacity,
            class_teacher_id: cls.class_teacher_id,
            academic_year_id: cls.academic_year_id,
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
            ? this.classService.updateClass(id, data)
            : this.classService.createClass(data);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.editingId.set(null);
                this.form.reset();
                this.successMessage.set(id ? 'Class updated successfully.' : 'Class created successfully.');
                this.loadClasses();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to save class. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    viewClass(cls: SchoolClass): void {
        this.router.navigate(['/tenant/classes', cls.id]);
    }

    deleteClass(cls: SchoolClass): void {
        if (!confirm(`Are you sure you want to delete "${cls.name}"?`)) return;
        this.classService.deleteClass(cls.id).subscribe({
            next: () => {
                this.successMessage.set('Class deleted successfully.');
                this.loadClasses();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to delete class.');
            },
        });
    }
}
