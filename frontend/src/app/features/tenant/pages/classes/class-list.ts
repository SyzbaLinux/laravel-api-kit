import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, School } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import { SchoolClass } from '../../../../core/models/school-admin.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';

@Component({
    selector: 'app-class-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbModal, ZbInput, ZbButton, ZbDatatable],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Classes</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school classes and their assignments</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openAddModal()" aria-label="Add new class">
          Add Class
        </zb-button>
      </div>

      <!-- Skeleton Loader -->
      @if (loading()) {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4"
             aria-label="Loading classes" role="status">
          <!-- Search bar skeleton -->
          <div class="mb-4 h-10 bg-slate-200 dark:bg-slate-700 rounded-sm animate-pulse"></div>
          <!-- Header row skeleton -->
          <div class="flex gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
            @for (w of skeletonCols; track w) {
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" [style.width]="w"></div>
            }
          </div>
          <!-- Data rows skeleton -->
          @for (row of skeletonRows; track row) {
            <div class="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              @for (w of skeletonCols; track w) {
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" [style.width]="w"></div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <zb-datatable
            [data]="classes()"
            [columns]="columns"
            [actions]="tableActions"
            trackBy="id" />
        </div>
      }
    </div>

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <zb-modal
        [title]="editingId() ? 'Edit Class' : 'New Class'"
        [icon]="SchoolIcon"
        size="md"
        (close)="closeModal()">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">
          @if (formError()) {
            <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ formError() }}
            </div>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <zb-input
              formControlName="name"
              label="Class Name"
              placeholder="e.g. Form 1A"
              [required]="true"
              [error]="getFieldError('name', 'Class name is required')" />

            <zb-input
              formControlName="grade_level"
              label="Grade Level"
              placeholder="e.g. Form 1"
              [required]="true"
              [error]="getFieldError('grade_level', 'Grade level is required')" />

            <zb-input
              formControlName="stream"
              label="Stream"
              placeholder="e.g. Science, Arts" />

            <zb-input
              formControlName="capacity"
              type="number"
              label="Capacity"
              placeholder="e.g. 40"
              [required]="true"
              [error]="getFieldError('capacity', 'Capacity must be at least 1')" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <zb-button variant="outline" type="button" (clicked)="closeModal()">Cancel</zb-button>
            <zb-button
              variant="primary"
              type="submit"
              [loading]="submitting()"
              [disabled]="form.invalid">
              {{ editingId() ? 'Update Class' : 'Create Class' }}
            </zb-button>
          </div>
        </form>
      </zb-modal>
    }
  `,
})
export class ClassList implements OnInit {
    private readonly classService = inject(ClassService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly PlusIcon = Plus;
    readonly SchoolIcon = School;

    // Skeleton layout — column widths mirror the datatable columns
    readonly skeletonCols = ['25%', '15%', '12%', '12%', '18%', '10%'];
    readonly skeletonRows = [1, 2, 3, 4, 5, 6];

    readonly classes = signal<SchoolClass[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showModal = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly formError = signal<string | null>(null);

    readonly columns: DataTableColumn<SchoolClass>[] = [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'grade_level', label: 'Grade', sortable: true },
        { key: 'stream', label: 'Stream', formatter: v => (v as string) || '—' },
        {
            key: 'capacity',
            label: 'Enrolment',
            formatter: (_v, item) => {
                const cls = item as SchoolClass;
                return `${cls.students_count ?? 0} / ${cls.capacity}`;
            },
        },
        {
            key: 'class_teacher',
            label: 'Class Teacher',
            formatter: v => (v as { name?: string } | undefined)?.name ?? '—',
        },
        {
            key: 'academic_year_id',
            label: 'Year',
            formatter: (_v, item) => (item as SchoolClass & { academic_year?: { name: string } }).academic_year?.name ?? '—',
        },
    ];

    readonly tableActions: DataTableAction<SchoolClass>[] = [
        { label: 'View', variant: 'outline', size: 'sm', callback: cls => this.viewClass(cls) },
        { label: 'Edit', variant: 'outline', size: 'sm', callback: cls => this.editClass(cls) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: cls => this.deleteClass(cls) },
    ];

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
        this.classService.getClasses({ per_page: 100 }).subscribe({
            next: (res) => {
                this.classes.set(res.data.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load classes.');
                this.loading.set(false);
            },
        });
    }

    openAddModal(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', grade_level: '', stream: '', capacity: 30, class_teacher_id: null, academic_year_id: null });
        this.formError.set(null);
        this.showModal.set(true);
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
        this.formError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingId.set(null);
        this.form.reset();
        this.formError.set(null);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.formError.set(null);

        const data = this.form.value;
        const id = this.editingId();

        const request = id
            ? this.classService.updateClass(id, data)
            : this.classService.createClass(data);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success(id ? 'Class updated successfully.' : 'Class created successfully.');
                this.loadClasses();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Failed to save class. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    viewClass(cls: SchoolClass): void {
        this.router.navigate(['/tenant/classes', cls.id]);
    }

    async deleteClass(cls: SchoolClass): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Delete Class',
            message: `Are you sure you want to delete "${cls.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger',
        });
        if (!confirmed) return;

        this.classService.deleteClass(cls.id).subscribe({
            next: () => {
                this.toast.success('Class deleted successfully.');
                this.loadClasses();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete class.');
            },
        });
    }

    getFieldError(field: string, message: string): string {
        const ctrl = this.form.get(field);
        return ctrl?.invalid && ctrl.touched ? message : '';
    }
}
