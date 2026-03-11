import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, School, Plus, ChevronLeft, ChevronRight } from 'lucide-angular';
import { SchoolService } from '../../services/school.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbCard } from '../../../../shared/components/ui/zb-card';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';
import { School as SchoolModel, SchoolStatus } from '../../models/school.models';

@Component({
    selector: 'app-school-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, FormsModule, LucideAngularModule, ZbCard, ZbButton, ZbDatatable],
    template: `
    <div class="px-6 py-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Schools</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all registered schools on the platform</p>
        </div>
        <a routerLink="/super-admin/schools/create">
          <zb-button [iconLeft]="PlusIcon">Add School</zb-button>
        </a>
      </div>

      <!-- Filters Bar -->
      <zb-card [padding]="'sm'" class="mb-6">
        <div class="flex items-center gap-2" role="group" aria-label="Filter by status">
          @for (status of statusFilters; track status.value) {
            <button
              (click)="onStatusFilter(status.value)"
              class="px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200"
              [class]="activeStatus() === status.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
              [attr.aria-pressed]="activeStatus() === status.value">
              {{ status.label }}
            </button>
          }
        </div>
      </zb-card>

      <!-- Schools Table -->
      <zb-card [padding]="'sm'">
        @if (schoolService.loading()) {
          <div class="py-12 text-center text-slate-500 dark:text-slate-400">
            <div class="inline-block w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 dark:border-t-primary-400 animate-spin mb-3"></div>
            <p class="text-sm">Loading schools...</p>
          </div>
        } @else {
          <zb-datatable
            [data]="schoolService.schools()"
            [columns]="schoolColumns"
            [actions]="schoolActions"
            trackBy="id" />
        }
      </zb-card>

      <!-- Pagination Footer -->
      @if (!schoolService.loading() && schoolService.schools().length > 0) {
        <div class="flex items-center justify-between px-6 py-4 mt-4">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Page <span class="font-semibold text-slate-700 dark:text-slate-300">{{ schoolService.currentPage() }}</span> of
            <span class="font-semibold text-slate-700 dark:text-slate-300">{{ schoolService.lastPage() }}</span>
            &nbsp;&mdash;&nbsp;
            <span class="font-semibold text-slate-700 dark:text-slate-300">{{ schoolService.totalSchools() }}</span> schools total
          </p>
          <div class="flex items-center gap-1">
            <button
              (click)="onPageChange(schoolService.currentPage() - 1)"
              [disabled]="schoolService.currentPage() <= 1"
              class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page">
              <lucide-icon [img]="ChevronLeftIcon" [size]="16"></lucide-icon>
            </button>
            <span class="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
              {{ schoolService.currentPage() }}
            </span>
            <button
              (click)="onPageChange(schoolService.currentPage() + 1)"
              [disabled]="schoolService.currentPage() >= schoolService.lastPage()"
              class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page">
              <lucide-icon [img]="ChevronRightIcon" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class SchoolListPage implements OnInit {
    readonly schoolService = inject(SchoolService);
    private readonly toast = inject(ToastService);
    private readonly alert = inject(AlertService);
    private readonly router = inject(Router);

    readonly activeStatus = signal<SchoolStatus | ''>('');

    // Icons
    readonly SchoolIcon = School;
    readonly PlusIcon = Plus;
    readonly ChevronLeftIcon = ChevronLeft;
    readonly ChevronRightIcon = ChevronRight;

    // Datatable columns
    readonly schoolColumns: DataTableColumn<SchoolModel>[] = [
        {
            key: 'name',
            label: 'School Name',
            sortable: true,
            filterable: true,
            formatter: (val) => String(val ?? ''),
        },
        {
            key: 'subscriptionPlan',
            label: 'Plan',
            sortable: false,
            formatter: (val: any) => val?.name ?? 'None',
        },
        {
            key: 'studentCount',
            label: 'Students',
            sortable: false,
            formatter: (val) => String(val ?? 0),
        },
        {
            key: 'teacherCount',
            label: 'Teachers',
            sortable: false,
            formatter: (val) => String(val ?? 0),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            formatter: (val) => {
                const status = val as string;
                switch (status) {
                    case 'active': return '● Active';
                    case 'inactive': return '● Inactive';
                    case 'suspended': return '● Suspended';
                    default: return status;
                }
            },
        },
    ];

    // Datatable actions
    readonly schoolActions: DataTableAction<SchoolModel>[] = [
        {
            label: 'View',
            variant: 'outline',
            size: 'sm',
            callback: (school) => this.router.navigate(['/super-admin/schools', school.id]),
        },
        {
            label: 'Edit',
            variant: 'primary',
            size: 'sm',
            callback: (school) => this.router.navigate(['/super-admin/schools', school.id, 'edit']),
        },
        {
            label: 'Activate' as any,
            variant: 'secondary',
            size: 'sm',
            callback: (school) => this.onToggleStatus(school.id, school.status),
            visible: (school) => school.status !== 'active',
        },
        {
            label: 'Deactivate' as any,
            variant: 'secondary',
            size: 'sm',
            callback: (school) => this.onToggleStatus(school.id, school.status),
            visible: (school) => school.status === 'active',
        },
        {
            label: 'Delete',
            variant: 'danger',
            size: 'sm',
            callback: (school) => this.onDelete(school.id, school.name),
        },
    ];

    readonly statusFilters = [
        { label: 'All', value: '' as const },
        { label: 'Active', value: 'active' as SchoolStatus },
        { label: 'Inactive', value: 'inactive' as SchoolStatus },
        { label: 'Suspended', value: 'suspended' as SchoolStatus },
    ];

    ngOnInit(): void {
        this.schoolService.loadSchools({ page: 1, perPage: 15 });
    }

    onStatusFilter(status: SchoolStatus | ''): void {
        this.activeStatus.set(status);
        this.schoolService.loadSchools({
            status: status || undefined,
            page: 1,
            perPage: 15,
        });
    }

    onPageChange(page: number): void {
        this.schoolService.loadSchools({
            status: this.activeStatus() || undefined,
            page,
            perPage: 15,
        });
    }

    onToggleStatus(id: string, currentStatus: SchoolStatus): void {
        const newStatus: SchoolStatus = currentStatus === 'active' ? 'inactive' : 'active';
        this.schoolService.toggleStatus(id, newStatus).subscribe({
            next: () => {
                this.toast.success(`School ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
            },
            error: (err) => {
                this.toast.error('Failed to update status', err.error?.message);
            },
        });
    }

    async onDelete(id: string, name: string): Promise<void> {
        const confirmed = await this.alert.confirm({
            title: 'Delete School',
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (!confirmed) return;

        this.schoolService.deleteSchool(id).subscribe({
            next: () => {
                this.toast.success('School deleted successfully.');
            },
            error: (err) => {
                this.toast.error('Failed to delete school', err.error?.message);
            },
        });
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'active': return 'bg-accent-50 dark:bg-accent-950/50 text-accent-700 dark:text-accent-400';
            case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            case 'suspended': return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    getStatusDot(status: string): string {
        switch (status) {
            case 'active': return 'bg-accent-500';
            case 'inactive': return 'bg-slate-400';
            case 'suspended': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    }
}
