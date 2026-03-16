import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, BookMarked, Link } from 'lucide-angular';
import { SubjectService } from '../../services/subject.service';
import { DepartmentService } from '../../services/department.service';
import { Subject, Department } from '../../../../core/models/school-admin.models';
import { AuthService } from '../../../../core/services/auth.service';
import { AssignSubjectModal } from '../../components/assign-subject-modal';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbCheckbox } from '../../../../shared/components/ui/zb-checkbox';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';

@Component({
    selector: 'app-subject-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, AssignSubjectModal, ZbButton, ZbModal, ZbInput, ZbSelect, ZbCheckbox, ZbDatatable],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Subjects</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage school subjects across all departments</p>
        </div>
        <zb-button [iconLeft]="BookMarkedIcon" (clicked)="openCreateModal()">Add Subject</zb-button>
      </div>

      <!-- Table Card -->
      <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
        @if (loading()) {
          <div class="flex items-center justify-center py-12" role="status" aria-label="Loading subjects">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <zb-datatable
            [data]="subjects()"
            [columns]="tableColumns"
            [actions]="tableActions" />
        }
      </div>
    </div>

    <!-- Create / Edit Modal -->
    @if (showFormModal()) {
      <zb-modal [title]="editingId() ? 'Edit Subject' : 'New Subject'" [icon]="BookMarkedIcon" size="md" (close)="closeFormModal()">
        <div class="px-6 py-5">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <zb-input
                formControlName="name"
                label="Subject Name"
                placeholder="e.g. Mathematics"
                [required]="true"
                [error]="form.get('name')?.invalid && form.get('name')?.touched ? 'Subject name is required' : ''" />

              <zb-input
                formControlName="code"
                label="Subject Code"
                placeholder="e.g. MATH101"
                [required]="true"
                [error]="form.get('code')?.invalid && form.get('code')?.touched ? 'Subject code is required' : ''" />

              <div class="md:col-span-2">
                <zb-select
                  formControlName="department_id"
                  label="Department"
                  [options]="departmentOptions()" />
              </div>

              <div class="md:col-span-2">
                <zb-input
                  formControlName="description"
                  label="Description"
                  placeholder="Optional description" />
              </div>

              <div class="md:col-span-2">
                <zb-checkbox
                  formControlName="is_active"
                  label="Active Subject" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-6">
              <zb-button variant="outline" type="button" (clicked)="closeFormModal()">Cancel</zb-button>
              <zb-button variant="primary" type="submit" [loading]="submitting()" [disabled]="form.invalid">
                {{ editingId() ? 'Update Subject' : 'Create Subject' }}
              </zb-button>
            </div>
          </form>
        </div>
      </zb-modal>
    }

    <!-- Assign Subject Modal -->
    @if (assigningSubject()) {
      <app-assign-subject-modal
        [subjectId]="assigningSubject()!.id"
        [subjectName]="assigningSubject()!.name"
        (onClose)="assigningSubject.set(null)"
        (onAssigned)="onAssigned()" />
    }
  `,
})
export class SubjectList implements OnInit {
    private readonly subjectService = inject(SubjectService);
    private readonly departmentService = inject(DepartmentService);
    private readonly authService = inject(AuthService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly BookMarkedIcon = BookMarked;
    readonly LinkIcon = Link;

    readonly assigningSubject = signal<Subject | null>(null);
    readonly subjects = signal<Subject[]>([]);
    readonly departments = signal<Department[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showFormModal = signal(false);
    readonly editingId = signal<number | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        code: ['', [Validators.required, Validators.maxLength(50)]],
        description: [''],
        department_id: [''],
        is_active: [true],
    });

    readonly departmentOptions = computed<SelectOption[]>(() => [
        { value: '', label: 'No Department' },
        ...this.departments().map(d => ({ value: String(d.id), label: d.name })),
    ]);

    readonly tableColumns: DataTableColumn<Subject>[] = [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            htmlFormatter: (s) => `<span class="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">${(s as Subject).code}</span>`,
        },
        {
            key: 'department_id',
            label: 'Department',
            formatter: (_v, item) => (item as Subject).department?.name ?? '—',
        },
        {
            key: 'is_active',
            label: 'Status',
            htmlFormatter: (s) => {
                const active = (s as Subject).is_active;
                return active
                    ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>`
                    : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">Inactive</span>`;
            },
        },
    ];

    readonly tableActions: DataTableAction<Subject>[] = [
        { label: 'Assign', variant: 'secondary', size: 'sm', callback: s => this.openAssign(s) },
        { label: 'Activate', variant: 'outline', size: 'sm', visible: s => !s.is_active, callback: s => this.toggleActive(s) },
        { label: 'Deactivate', variant: 'outline', size: 'sm', visible: s => s.is_active, callback: s => this.toggleActive(s) },
        { label: 'Edit', variant: 'outline', size: 'sm', callback: s => this.editSubject(s) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: s => this.deleteSubject(s) },
    ];

    ngOnInit(): void {
        this.loadSubjects();
        this.loadDepartments();
    }

    loadSubjects(): void {
        this.loading.set(true);
        this.subjectService.getSubjects({ per_page: 100 }).subscribe({
            next: (res) => {
                this.subjects.set(res.data.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load subjects.');
                this.loading.set(false);
            },
        });
    }

    loadDepartments(): void {
        this.departmentService.getDepartments({ per_page: 100 }).subscribe({
            next: (res) => this.departments.set(res.data.data),
            error: () => {},
        });
    }

    openCreateModal(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', code: '', description: '', department_id: '', is_active: true });
        this.showFormModal.set(true);
    }

    editSubject(subject: Subject): void {
        this.editingId.set(subject.id);
        this.form.patchValue({
            name: subject.name,
            code: subject.code,
            description: subject.description ?? '',
            department_id: subject.department_id ? String(subject.department_id) : '',
            is_active: subject.is_active,
        });
        this.showFormModal.set(true);
    }

    closeFormModal(): void {
        this.showFormModal.set(false);
        this.editingId.set(null);
        this.form.reset();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const raw = this.form.value;
        const schoolLevel = this.authService.schoolEducationLevel();
        const data = {
            ...raw,
            department_id: raw.department_id ? Number(raw.department_id) : null,
            education_level: (schoolLevel && schoolLevel !== 'combined') ? schoolLevel : 'all',
        };
        const id = this.editingId();

        const request = id
            ? this.subjectService.updateSubject(id, data)
            : this.subjectService.createSubject(data);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeFormModal();
                this.toast.success(id ? 'Subject updated successfully.' : 'Subject created successfully.');
                this.loadSubjects();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save subject.');
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
                this.toast.error('Error', err?.error?.message ?? 'Failed to update subject status.');
            },
        });
    }

    async deleteSubject(subject: Subject): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Delete Subject',
            message: `Are you sure you want to delete "${subject.name}"?`,
            confirmText: 'Delete',
            type: 'danger',
        });
        if (!confirmed) return;
        this.subjectService.deleteSubject(subject.id).subscribe({
            next: () => {
                this.toast.success('Subject deleted successfully.');
                this.loadSubjects();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete subject.');
            },
        });
    }

    openAssign(subject: Subject): void {
        this.assigningSubject.set(subject);
    }

    onAssigned(): void {
        this.toast.success('Subject assigned successfully.');
    }
}
