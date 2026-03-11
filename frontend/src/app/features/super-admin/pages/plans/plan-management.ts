import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, Check, X, CreditCard } from 'lucide-angular';
import { SchoolService } from '../../services/school.service';
import { SubscriptionPlan } from '../../models/school.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbCard } from '../../../../shared/components/ui/zb-card';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';

@Component({
    selector: 'app-plan-management',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbCard, ZbButton, ZbInput, ZbDatatable],
    template: `
    <div class="px-6 py-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Subscription Plans</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage service plans for schools</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openForm()">New Plan</zb-button>
      </div>

      <!-- Create/Edit Form -->
      @if (showForm()) {
        <zb-card
          [title]="editingPlan() ? 'Edit Plan' : 'Create New Plan'"
          [headerBorder]="true"
          class="mb-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <zb-input
                label="Plan Name"
                placeholder="e.g. Professional"
                [required]="true"
                formControlName="name"
                [error]="getError('name')" />

              <zb-input
                label="Monthly Price ($)"
                type="number"
                placeholder="99"
                [required]="true"
                formControlName="price"
                [error]="getError('price')" />

              <zb-input
                label="Yearly Price ($)"
                type="number"
                placeholder="999"
                formControlName="priceYearly"
                hint="Optional — leave blank to skip"
                [error]="getError('priceYearly')" />

              <zb-input
                label="Max Storage (GB)"
                type="number"
                placeholder="10"
                formControlName="maxStorageGb"
                [error]="getError('maxStorageGb')" />

              <zb-input
                label="Max Students"
                type="number"
                placeholder="500"
                [required]="true"
                formControlName="maxStudents"
                [error]="getError('maxStudents')" />

              <zb-input
                label="Max Teachers"
                type="number"
                placeholder="50"
                [required]="true"
                formControlName="maxTeachers"
                [error]="getError('maxTeachers')" />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5" for="features-input">
                Features <span class="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input
                id="features-input"
                type="text"
                placeholder="Reports, Attendance, LMS, Analytics"
                formControlName="featuresInput"
                class="w-full px-4 py-2.5 rounded-sm border text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:outline-none transition-colors" />
            </div>

            <div class="flex items-center gap-3 pt-2">
              <zb-button
                type="submit"
                [iconLeft]="CheckIcon"
                [disabled]="form.invalid || schoolService.plansLoading()"
                [loading]="schoolService.plansLoading()">
                {{ editingPlan() ? 'Update Plan' : 'Create Plan' }}
              </zb-button>
              <zb-button variant="ghost" [iconLeft]="XIcon" (clicked)="closeForm()">Cancel</zb-button>
            </div>
          </form>
        </zb-card>
      }

      <!-- Plans Table -->
      <zb-card [padding]="'sm'">
        @if (schoolService.plansLoading()) {
          <div class="py-12 text-center text-slate-500 dark:text-slate-400">
            <div class="inline-block w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 dark:border-t-primary-400 animate-spin mb-3"></div>
            <p class="text-sm">Loading plans...</p>
          </div>
        } @else if (schoolService.plans().length === 0) {
          <div class="text-center py-12">
            <div class="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <lucide-icon [img]="CreditCardIcon" [size]="24" class="text-slate-400"></lucide-icon>
            </div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">No subscription plans yet</p>
            <p class="text-xs text-slate-400 mt-1">Create your first plan to get started</p>
          </div>
        } @else {
          <zb-datatable
            [data]="schoolService.plans()"
            [columns]="planColumns"
            [actions]="planActions"
            trackBy="id" />
        }
      </zb-card>
    </div>
  `,
})
export class PlanManagementPage implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alert = inject(AlertService);
    readonly schoolService = inject(SchoolService);

    readonly showForm = signal(false);
    readonly editingPlan = signal<SubscriptionPlan | null>(null);

    // Icons
    readonly PlusIcon = Plus;
    readonly PencilIcon = Pencil;
    readonly TrashIcon = Trash2;
    readonly CheckIcon = Check;
    readonly XIcon = X;
    readonly CreditCardIcon = CreditCard;

    // Datatable columns
    readonly planColumns: DataTableColumn<SubscriptionPlan>[] = [
        {
            key: 'name',
            label: 'Plan Name',
            sortable: true,
            filterable: true,
        },
        {
            key: 'price_monthly',
            label: 'Monthly Price',
            sortable: false,
            formatter: (val) => `$${val}`,
        },
        {
            key: 'max_students',
            label: 'Max Students',
            sortable: false,
            formatter: (val) => String(val),
        },
        {
            key: 'max_teachers',
            label: 'Max Teachers',
            sortable: false,
            formatter: (val) => String(val),
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: false,
            formatter: (val) => val ? '✓ Active' : '✗ Inactive',
        },
        {
            key: 'features',
            label: 'Features',
            sortable: false,
            formatter: (val: any) => `${val?.length || 0} features`,
        },
    ];

    // Datatable actions
    readonly planActions: DataTableAction<SubscriptionPlan>[] = [
        {
            label: 'Edit',
            variant: 'primary',
            size: 'sm',
            callback: (plan) => this.onEdit(plan),
        },
        {
            label: 'Delete',
            variant: 'danger',
            size: 'sm',
            callback: (plan) => this.onDeletePlan(plan.id, plan.name),
        },
    ];

    readonly form = this.fb.group({
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        priceYearly: [null as number | null],
        maxStudents: [100, [Validators.required, Validators.min(1)]],
        maxTeachers: [10, [Validators.required, Validators.min(1)]],
        maxStorageGb: [10, [Validators.min(1)]],
        featuresInput: [''],
    });

    ngOnInit(): void {
        this.schoolService.loadPlans();
    }

    openForm(): void {
        this.editingPlan.set(null);
        this.form.reset({ price: 0, maxStudents: 100, maxTeachers: 10, maxStorageGb: 10 });
        this.showForm.set(true);
    }

    closeForm(): void {
        this.showForm.set(false);
        this.editingPlan.set(null);
    }

    onEdit(plan: SubscriptionPlan): void {
        this.editingPlan.set(plan);
        this.form.patchValue({
            name: plan.name,
            price: plan.price_monthly,
            priceYearly: plan.price_yearly ?? null,
            maxStudents: plan.max_students,
            maxTeachers: plan.max_teachers,
            maxStorageGb: plan.max_storage_gb ?? 10,
            featuresInput: plan.features.join(', '),
        });
        this.showForm.set(true);
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const values = this.form.getRawValue();
        const features = (values.featuresInput ?? '')
            .split(',')
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);

        const payload = {
            name: values.name ?? '',
            price_monthly: values.price ?? 0,
            price_yearly: values.priceYearly ?? undefined,
            max_students: values.maxStudents ?? 100,
            max_teachers: values.maxTeachers ?? 10,
            max_storage_gb: values.maxStorageGb ?? 10,
            features,
        };

        const editing = this.editingPlan();
        if (editing) {
            this.schoolService.updatePlan(editing.id, payload).subscribe({
                next: () => {
                    this.toast.success('Plan updated successfully!');
                    this.closeForm();
                },
                error: (err) => {
                    this.toast.error('Failed to update plan', err.error?.message);
                },
            });
        } else {
            this.schoolService.createPlan(payload).subscribe({
                next: () => {
                    this.toast.success('Plan created successfully!');
                    this.closeForm();
                },
                error: (err) => {
                    this.toast.error('Failed to create plan', err.error?.message);
                },
            });
        }
    }

    async onDeletePlan(id: number, name: string): Promise<void> {
        const confirmed = await this.alert.confirm({
            title: 'Delete Plan',
            message: `Are you sure you want to delete the "${name}" plan? Schools using this plan will be affected.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (!confirmed) return;

        this.schoolService.deletePlan(id).subscribe({
            next: () => {
                this.toast.success('Plan deleted successfully.');
            },
            error: (err) => {
                this.toast.error('Failed to delete plan', err.error?.message);
            },
        });
    }

    getError(field: string): string {
        const control = this.form.get(field);
        if (!control?.touched || !control?.errors) return '';
        if (control.errors['required']) return 'This field is required';
        if (control.errors['min']) return `Must be at least ${control.errors['min'].min}`;
        return '';
    }

}
