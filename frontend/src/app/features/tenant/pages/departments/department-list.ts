import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Building2 } from 'lucide-angular';
import { DepartmentService } from '../../services/department.service';
import { Department, User } from '../../../../core/models/school-admin.models';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
    selector: 'app-department-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbDatatable, ZbModal, ZbInput, ZbSelect, ZbButton],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school departments and their heads</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openCreateModal()" aria-label="Add department">
          Add Department
        </zb-button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading departments">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Datatable -->
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <zb-datatable
            [data]="departments()"
            [columns]="columns"
            [actions]="tableActions"
            trackBy="id" />
        </div>
      }
    </div>

    <!-- Create / Edit Modal -->
    @if (showModal()) {
      <zb-modal
        [title]="editingId() ? 'Edit Department' : 'New Department'"
        [icon]="Building2Icon"
        size="md"
        (close)="closeModal()">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">
          <!-- Error inside modal -->
          @if (formError()) {
            <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ formError() }}
            </div>
          }

          <zb-input
            formControlName="name"
            label="Department Name"
            placeholder="e.g. Science Department"
            [required]="true"
            [error]="nameError()" />

          <zb-input
            formControlName="description"
            label="Description"
            placeholder="Optional description" />

          <zb-select
            formControlName="hod_id"
            label="Head of Department"
            [options]="hodOptions()"
            placeholderOption="— No Head of Department —" />

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <zb-button variant="outline" type="button" (clicked)="closeModal()">Cancel</zb-button>
            <zb-button
              variant="primary"
              type="submit"
              [loading]="submitting()"
              [disabled]="form.invalid">
              {{ editingId() ? 'Update Department' : 'Create Department' }}
            </zb-button>
          </div>
        </form>
      </zb-modal>
    }
  `,
})
export class DepartmentList implements OnInit {
    private readonly departmentService = inject(DepartmentService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly PlusIcon = Plus;
    readonly Building2Icon = Building2;

    readonly departments = signal<Department[]>([]);
    readonly teachers = signal<User[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showModal = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly formError = signal<string | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        description: [''],
        hod_id: [''],
    });

    readonly nameError = computed(() =>
        this.form.get('name')?.invalid && this.form.get('name')?.touched ? 'Department name is required' : ''
    );

    readonly hodOptions = computed<SelectOption[]>(() => [
        { value: '', label: '— No Head of Department —' },
        ...this.teachers().map(t => ({ value: String(t.id), label: t.name })),
    ]);

    readonly columns: DataTableColumn<Department>[] = [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'description', label: 'Description', formatter: v => (v as string) || '—' },
        { key: 'hod', label: 'Head of Department', formatter: v => (v as User | undefined)?.name ?? 'Not assigned' },
        { key: 'subjects_count', label: 'Subjects', formatter: v => `${v ?? 0}` },
    ];

    readonly tableActions: DataTableAction<Department>[] = [
        { label: 'Edit', variant: 'outline', size: 'sm', callback: d => this.editDepartment(d) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: d => this.deleteDepartment(d) },
    ];

    ngOnInit(): void {
        this.loadDepartments();
        this.loadTeachers();
    }

    loadTeachers(): void {
        this.departmentService.getTeachers({ per_page: 100 }).subscribe({
            next: (res) => this.teachers.set(res.data.data),
            error: () => {},
        });
    }

    loadDepartments(): void {
        this.loading.set(true);
        this.departmentService.getDepartments({ per_page: 100, include: 'hod' }).subscribe({
            next: (res) => {
                this.departments.set(res.data.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load departments.');
                this.loading.set(false);
            },
        });
    }

    openCreateModal(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', description: '', hod_id: '' });
        this.formError.set(null);
        this.showModal.set(true);
    }

    editDepartment(dept: Department): void {
        this.editingId.set(dept.id);
        this.form.reset({
            name: dept.name,
            description: dept.description ?? '',
            hod_id: dept.hod_id ? String(dept.hod_id) : '',
        });
        this.formError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingId.set(null);
        this.form.reset();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.formError.set(null);

        const values = this.form.value;
        const payload = {
            name: values.name,
            description: values.description || null,
            hod_id: values.hod_id ? Number(values.hod_id) : null,
        };
        const id = this.editingId();

        const request = id
            ? this.departmentService.updateDepartment(id, payload)
            : this.departmentService.createDepartment(payload);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success(id ? 'Department updated.' : 'Department created.');
                this.loadDepartments();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Failed to save department.');
                this.submitting.set(false);
            },
        });
    }

    async deleteDepartment(dept: Department): Promise<void> {
        const confirmed = await this.alertService.confirm({ title: 'Confirm', message: `Delete "${dept.name}"? This cannot be undone.`, confirmText: 'Delete', type: 'danger' });
        if (!confirmed) return;

        this.departmentService.deleteDepartment(dept.id).subscribe({
            next: () => {
                this.toast.success('Department deleted.');
                this.loadDepartments();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete department.');
            },
        });
    }
}
