import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Calendar, ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-angular';
import { AcademicYearService } from '../../services/academic-year.service';
import { AcademicYear, AcademicTerm } from '../../../../core/models/school-admin.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbDatepicker } from '../../../../shared/components/ui/zb-datepicker';

interface YearWithTerms extends AcademicYear {
    expanded: boolean;
    loadingTerms: boolean;
}

@Component({
    selector: 'app-academic-year-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbButton, ZbModal, ZbInput, ZbDatepicker],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Academic Years</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage academic years and their terms</p>
        </div>
        <zb-button [iconLeft]="CalendarIcon" (clicked)="openYearModal()">Add Year</zb-button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading academic years">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (years().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mx-auto mb-4">
            <lucide-icon [img]="CalendarIcon" [size]="28" class="text-slate-400"></lucide-icon>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No academic years yet</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Create your first academic year to get started.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (year of years(); track year.id) {
            <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800"
                 [class.border-primary-300]="year.is_current"
                 [class.dark:border-primary-700]="year.is_current">

              <!-- Year Header -->
              <div class="flex items-center justify-between px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                       [class]="year.is_current
                         ? 'bg-primary-50 dark:bg-primary-900/30'
                         : 'bg-slate-100 dark:bg-slate-800'">
                    <lucide-icon
                      [img]="year.is_current ? CheckCircleIcon : CalendarIcon"
                      [size]="20"
                      [class]="year.is_current
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400'">
                    </lucide-icon>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-slate-900 dark:text-white">{{ year.name }}</h3>
                      @if (year.is_current) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          Current
                        </span>
                      }
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ formatDate(year.start_date) }} — {{ formatDate(year.end_date) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  @if (!year.is_current) {
                    <zb-button variant="outline" size="sm" (clicked)="setCurrent(year)">Set Current</zb-button>
                  }
                  <zb-button variant="danger" size="sm" (clicked)="deleteYear(year)">Delete</zb-button>
                  <zb-button variant="ghost" size="sm" (clicked)="toggleExpanded(year)"
                    [attr.aria-label]="year.expanded ? 'Collapse ' + year.name : 'Expand ' + year.name">
                    <lucide-icon [img]="year.expanded ? ChevronUpIcon : ChevronDownIcon" [size]="18"></lucide-icon>
                  </zb-button>
                </div>
              </div>

              <!-- Expandable Terms Section -->
              @if (year.expanded) {
                <div class="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Terms</h4>
                    <zb-button variant="secondary" size="sm" (clicked)="openTermModal(year)">Add Term</zb-button>
                  </div>

                  @if (year.loadingTerms) {
                    <div class="flex items-center gap-2 py-4 text-sm text-slate-500">
                      <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading terms...
                    </div>
                  } @else if (!year.terms || year.terms.length === 0) {
                    <p class="text-sm text-slate-400 dark:text-slate-500 py-2">No terms added yet.</p>
                  } @else {
                    <div class="space-y-2">
                      @for (term of year.terms; track term.id) {
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-slate-100 dark:border-slate-700">
                          <div class="flex items-center gap-3">
                            <lucide-icon
                              [img]="term.is_current ? CheckCircleIcon : CircleIcon"
                              [size]="16"
                              [class]="term.is_current ? 'text-primary-500' : 'text-slate-300 dark:text-slate-600'">
                            </lucide-icon>
                            <div>
                              <div class="flex items-center gap-2">
                                <span class="text-sm font-medium text-slate-900 dark:text-white">{{ term.name }}</span>
                                @if (term.is_current) {
                                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                                    Current
                                  </span>
                                }
                              </div>
                              <p class="text-xs text-slate-500 dark:text-slate-400">
                                {{ formatDate(term.start_date) }} — {{ formatDate(term.end_date) }}
                              </p>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            @if (!term.is_current) {
                              <zb-button variant="outline" size="sm" (clicked)="setCurrentTerm(term, year)">Set Current</zb-button>
                            }
                            <zb-button variant="danger" size="sm" (clicked)="deleteTerm(term, year)">Delete</zb-button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Add Academic Year Modal -->
    @if (showYearModal()) {
      <zb-modal title="New Academic Year" [icon]="CalendarIcon" size="md" (close)="closeYearModal()">
        <div class="px-6 py-5">
          <form [formGroup]="yearForm" (ngSubmit)="onCreateYear()">
            <div class="space-y-4">
              <zb-input
                formControlName="name"
                label="Year Name"
                placeholder="e.g. 2025"
                [required]="true"
                [error]="yearForm.get('name')?.invalid && yearForm.get('name')?.touched ? 'Year name is required' : ''" />

              <div class="grid grid-cols-2 gap-4">
                <zb-datepicker
                  formControlName="start_date"
                  label="Start Date"
                  [required]="true" />

                <zb-datepicker
                  formControlName="end_date"
                  label="End Date"
                  [required]="true" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-6">
              <zb-button variant="outline" type="button" (clicked)="closeYearModal()">Cancel</zb-button>
              <zb-button variant="primary" type="submit" [loading]="submittingYear()" [disabled]="yearForm.invalid">
                Create Year
              </zb-button>
            </div>
          </form>
        </div>
      </zb-modal>
    }

    <!-- Add Term Modal -->
    @if (showTermModal()) {
      <zb-modal title="Add Term" [icon]="CalendarIcon" size="md" (close)="closeTermModal()">
        <div class="px-6 py-5">
          <form [formGroup]="termForm" (ngSubmit)="onCreateTerm()">
            <div class="space-y-4">
              <zb-input
                formControlName="name"
                label="Term Name"
                placeholder="e.g. Term 1"
                [required]="true"
                [error]="termForm.get('name')?.invalid && termForm.get('name')?.touched ? 'Term name is required' : ''" />

              <div class="grid grid-cols-2 gap-4">
                <zb-datepicker
                  formControlName="start_date"
                  label="Start Date" />

                <zb-datepicker
                  formControlName="end_date"
                  label="End Date" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-6">
              <zb-button variant="outline" type="button" (clicked)="closeTermModal()">Cancel</zb-button>
              <zb-button variant="primary" type="submit" [loading]="submittingTerm()" [disabled]="termForm.invalid">
                Add Term
              </zb-button>
            </div>
          </form>
        </div>
      </zb-modal>
    }
  `,
})
export class AcademicYearList implements OnInit {
    private readonly academicYearService = inject(AcademicYearService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly CalendarIcon = Calendar;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronUpIcon = ChevronUp;
    readonly CheckCircleIcon = CheckCircle;
    readonly CircleIcon = Circle;

    readonly years = signal<YearWithTerms[]>([]);
    readonly loading = signal(false);
    readonly submittingYear = signal(false);
    readonly submittingTerm = signal(false);
    readonly showYearModal = signal(false);
    readonly showTermModal = signal(false);
    readonly activeYearId = signal<number | null>(null);

    readonly yearForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
    });

    readonly termForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        start_date: [''],
        end_date: [''],
    });

    ngOnInit(): void {
        this.loadYears();
    }

    loadYears(): void {
        this.loading.set(true);
        this.academicYearService.getAcademicYears({ per_page: 50 }).subscribe({
            next: (res) => {
                this.years.set(res.data.data.map((y: AcademicYear) => ({ ...y, expanded: y.is_current, loadingTerms: false })));
                const current = this.years().find(y => y.is_current);
                if (current) this.loadTermsForYear(current);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load academic years.');
                this.loading.set(false);
            },
        });
    }

    toggleExpanded(year: YearWithTerms): void {
        this.years.update(list => list.map(y => {
            if (y.id !== year.id) return y;
            const expanding = !y.expanded;
            if (expanding && !y.terms) this.loadTermsForYear(y);
            return { ...y, expanded: expanding };
        }));
    }

    loadTermsForYear(year: YearWithTerms): void {
        this.years.update(list => list.map(y => y.id === year.id ? { ...y, loadingTerms: true } : y));
        this.academicYearService.getTerms(year.id).subscribe({
            next: (res) => {
                this.years.update(list => list.map(y =>
                    y.id === year.id ? { ...y, terms: res.data, loadingTerms: false } : y
                ));
            },
            error: () => {
                this.years.update(list => list.map(y => y.id === year.id ? { ...y, loadingTerms: false } : y));
            },
        });
    }

    openYearModal(): void {
        this.yearForm.reset({ name: '', start_date: '', end_date: '' });
        this.showYearModal.set(true);
    }

    closeYearModal(): void {
        this.showYearModal.set(false);
        this.yearForm.reset();
    }

    onCreateYear(): void {
        if (this.yearForm.invalid) { this.yearForm.markAllAsTouched(); return; }
        this.submittingYear.set(true);
        this.academicYearService.createAcademicYear(this.yearForm.value).subscribe({
            next: () => {
                this.submittingYear.set(false);
                this.closeYearModal();
                this.toast.success('Academic year created successfully.');
                this.loadYears();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to create academic year.');
                this.submittingYear.set(false);
            },
        });
    }

    setCurrent(year: AcademicYear): void {
        this.academicYearService.setCurrent(year.id).subscribe({
            next: () => {
                this.toast.success(`"${year.name}" set as the current academic year.`);
                this.loadYears();
            },
            error: (err) => this.toast.error('Error', err?.error?.message ?? 'Failed to set current year.'),
        });
    }

    async deleteYear(year: AcademicYear): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Delete Year',
            message: `Delete "${year.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger',
        });
        if (!confirmed) return;
        this.academicYearService.deleteAcademicYear(year.id).subscribe({
            next: () => {
                this.toast.success('Academic year deleted.');
                this.loadYears();
            },
            error: (err) => this.toast.error('Error', err?.error?.message ?? 'Failed to delete year.'),
        });
    }

    openTermModal(year: YearWithTerms): void {
        this.activeYearId.set(year.id);
        this.termForm.reset({ name: '', start_date: '', end_date: '' });
        this.showTermModal.set(true);
    }

    closeTermModal(): void {
        this.showTermModal.set(false);
        this.activeYearId.set(null);
        this.termForm.reset();
    }

    onCreateTerm(): void {
        if (this.termForm.invalid) { this.termForm.markAllAsTouched(); return; }
        const yearId = this.activeYearId();
        if (!yearId) return;
        this.submittingTerm.set(true);
        this.academicYearService.createTerm(yearId, this.termForm.value).subscribe({
            next: () => {
                this.submittingTerm.set(false);
                this.closeTermModal();
                this.toast.success('Term created successfully.');
                const year = this.years().find(y => y.id === yearId);
                if (year) this.loadTermsForYear(year);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to create term.');
                this.submittingTerm.set(false);
            },
        });
    }

    setCurrentTerm(term: AcademicTerm, year: YearWithTerms): void {
        this.academicYearService.setCurrentTerm(term.id).subscribe({
            next: () => {
                this.toast.success(`"${term.name}" set as current term.`);
                this.loadTermsForYear(year);
            },
            error: (err) => this.toast.error('Error', err?.error?.message ?? 'Failed to set current term.'),
        });
    }

    async deleteTerm(term: AcademicTerm, year: YearWithTerms): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Delete Term',
            message: `Delete "${term.name}"?`,
            confirmText: 'Delete',
            type: 'danger',
        });
        if (!confirmed) return;
        this.academicYearService.deleteTerm(term.id).subscribe({
            next: () => {
                this.toast.success('Term deleted.');
                this.loadTermsForYear(year);
            },
            error: (err) => this.toast.error('Error', err?.error?.message ?? 'Failed to delete term.'),
        });
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
