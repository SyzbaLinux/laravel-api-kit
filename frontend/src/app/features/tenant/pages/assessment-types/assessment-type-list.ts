import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, ListChecks } from 'lucide-angular';
import { AssessmentTypeService } from '../../services/assessment-type.service';
import { AssessmentType } from '../../../../core/models/school-admin.models';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
    selector: 'app-assessment-type-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbDatatable, ZbModal, ZbInput, ZbSelect, ZbButton],
    template: `
    <div class="p-6 lg:p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Assessment Types</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure types used for assessments (tests, exercises, exams)</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openCreateModal()">Add Type</zb-button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <zb-datatable [data]="types()" [columns]="columns" [actions]="tableActions" trackBy="id" />
        </div>
      }
    </div>

    @if (showModal()) {
      <zb-modal
        [title]="editingId() ? 'Edit Assessment Type' : 'New Assessment Type'"
        [icon]="ListChecksIcon"
        (close)="closeModal()">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">
          @if (formError()) {
            <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ formError() }}
            </div>
          }

          <zb-input formControlName="name" label="Name" placeholder="e.g. Monthly Test" [required]="true" />

          <div class="grid grid-cols-2 gap-4">
            <zb-select
              formControlName="category"
              label="Category"
              [options]="categoryOptions"
              placeholderOption="Select category"
              [required]="true" />
            <zb-input
              formControlName="weight"
              label="Weight (%)"
              type="number"
              placeholder="e.g. 20"
              [required]="true" />
          </div>

          <zb-select
            formControlName="is_active"
            label="Status"
            [options]="statusOptions"
            [required]="true" />

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <zb-button variant="outline" type="button" (clicked)="closeModal()">Cancel</zb-button>
            <zb-button variant="primary" type="submit" [loading]="submitting()" [disabled]="form.invalid">
              {{ editingId() ? 'Update' : 'Create' }}
            </zb-button>
          </div>
        </form>
      </zb-modal>
    }
  `,
})
export class AssessmentTypeList implements OnInit {
    private readonly service = inject(AssessmentTypeService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly PlusIcon = Plus;
    readonly ListChecksIcon = ListChecks;

    readonly types = signal<AssessmentType[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showModal = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly formError = signal<string | null>(null);

    readonly categoryOptions: SelectOption[] = [
        { value: 'continuous_assessment', label: 'Continuous Assessment (CA)' },
        { value: 'examination', label: 'Examination' },
    ];

    readonly statusOptions: SelectOption[] = [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
    ];

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        category: ['', [Validators.required]],
        weight: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        is_active: ['true', [Validators.required]],
    });

    readonly columns: DataTableColumn<AssessmentType>[] = [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        {
            key: 'category',
            label: 'Category',
            formatter: v => v === 'continuous_assessment' ? 'Continuous Assessment' : 'Examination',
        },
        { key: 'weight', label: 'Weight (%)', formatter: v => `${v}%` },
        {
            key: 'is_active',
            label: 'Status',
            formatter: v => v ? 'Active' : 'Inactive',
        },
    ];

    readonly tableActions: DataTableAction<AssessmentType>[] = [
        { label: 'Edit', variant: 'outline', size: 'sm', callback: t => this.editType(t) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: t => this.deleteType(t) },
    ];

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.service.getAssessmentTypes({ per_page: 100 }).subscribe({
            next: res => {
                this.types.set(res.data.data);
                this.loading.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load assessment types.');
                this.loading.set(false);
            },
        });
    }

    openCreateModal(): void {
        this.editingId.set(null);
        this.form.reset({ name: '', category: '', weight: 0, is_active: 'true' });
        this.formError.set(null);
        this.showModal.set(true);
    }

    editType(t: AssessmentType): void {
        this.editingId.set(t.id);
        this.form.reset({
            name: t.name,
            category: t.category as string,
            weight: t.weight,
            is_active: String(t.is_active),
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
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.submitting.set(true);
        this.formError.set(null);

        const v = this.form.value;
        const payload: Partial<AssessmentType> = {
            name: v.name ?? '',
            category: (v.category ?? '') as AssessmentType['category'],
            weight: Number(v.weight),
            is_active: v.is_active === 'true',
        };

        const id = this.editingId();
        const req = id
            ? this.service.updateAssessmentType(id, payload)
            : this.service.createAssessmentType(payload);

        req.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success(id ? 'Assessment type updated.' : 'Assessment type created.');
                this.load();
            },
            error: err => {
                this.formError.set(err?.error?.message ?? 'Failed to save.');
                this.submitting.set(false);
            },
        });
    }

    async deleteType(t: AssessmentType): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Delete Assessment Type',
            message: `Delete "${t.name}"? Any assessments using this type will be affected.`,
            confirmText: 'Delete',
            type: 'danger',
        });
        if (!confirmed) return;

        this.service.deleteAssessmentType(t.id).subscribe({
            next: () => {
                this.toast.success('Assessment type deleted.');
                this.load();
            },
            error: err => this.toast.error('Error', err?.error?.message ?? 'Failed to delete.'),
        });
    }
}
