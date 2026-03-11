import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, X, Calendar, ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-angular';
import { AcademicYearService } from '../../services/academic-year.service';
import { AcademicYear, AcademicTerm } from '../../../../core/models/school-admin.models';

interface YearWithTerms extends AcademicYear {
    expanded: boolean;
    loadingTerms: boolean;
}

@Component({
    selector: 'app-academic-year-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Academic Years</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage academic years and their terms</p>
        </div>
        <button
          (click)="showYearForm.set(!showYearForm())"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new academic year">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Year
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

      <!-- New Year Form -->
      @if (showYearForm()) {
        <div class="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">New Academic Year</h2>
            <button
              (click)="showYearForm.set(false)"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>
          <form [formGroup]="yearForm" (ngSubmit)="onCreateYear()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="year-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Year Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="year-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. 2025"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>
              <div>
                <label for="year-start" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Date <span class="text-red-500">*</span>
                </label>
                <input
                  id="year-start"
                  type="date"
                  formControlName="start_date"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>
              <div>
                <label for="year-end" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Date <span class="text-red-500">*</span>
                </label>
                <input
                  id="year-end"
                  type="date"
                  formControlName="end_date"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>
            </div>
            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                [disabled]="yearForm.invalid || submittingYear()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium">
                @if (submittingYear()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                } @else {
                  Create Academic Year
                }
              </button>
              <button
                type="button"
                (click)="showYearForm.set(false)"
                class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading academic years">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        @if (years().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="CalendarIcon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No academic years yet</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Create your first academic year to get started.</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (year of years(); track year.id) {
              <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                   [class.border-primary-300]="year.is_current"
                   [class.dark:border-primary-700]="year.is_current">

                <!-- Year Header -->
                <div class="flex items-center justify-between px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                         [class.bg-primary-50]="year.is_current"
                         [class.dark:bg-primary-900/30]="year.is_current"
                         [class.bg-slate-100]="!year.is_current"
                         [class.dark:bg-slate-800]="!year.is_current">
                      <lucide-icon
                        [img]="year.is_current ? CheckCircleIcon : CalendarIcon"
                        [size]="20"
                        [class.text-primary-600]="year.is_current"
                        [class.dark:text-primary-400]="year.is_current"
                        [class.text-slate-400]="!year.is_current"></lucide-icon>
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
                      <button
                        (click)="setCurrent(year)"
                        class="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                        Set Current
                      </button>
                    }
                    <button
                      (click)="deleteYear(year)"
                      class="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      [attr.aria-label]="'Delete ' + year.name">
                      <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
                    </button>
                    <button
                      (click)="toggleExpanded(year)"
                      class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      [attr.aria-label]="year.expanded ? 'Collapse ' + year.name : 'Expand ' + year.name">
                      <lucide-icon [img]="year.expanded ? ChevronUpIcon : ChevronDownIcon" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </div>

                <!-- Expandable Terms Section -->
                @if (year.expanded) {
                  <div class="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Terms</h4>
                      <button
                        (click)="showTermForm.set(showTermForm() === year.id ? null : year.id)"
                        class="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors">
                        <lucide-icon [img]="PlusIcon" [size]="12"></lucide-icon>
                        Add Term
                      </button>
                    </div>

                    <!-- Add Term Form -->
                    @if (showTermForm() === year.id) {
                      <div class="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <form [formGroup]="termForm" (ngSubmit)="onCreateTerm(year.id)" class="space-y-3">
                          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label [for]="'term-name-' + year.id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Term Name <span class="text-red-500">*</span>
                              </label>
                              <input
                                [id]="'term-name-' + year.id"
                                type="text"
                                formControlName="name"
                                placeholder="e.g. Term 1"
                                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                            </div>
                            <div>
                              <label [for]="'term-start-' + year.id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                              <input
                                [id]="'term-start-' + year.id"
                                type="date"
                                formControlName="start_date"
                                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                            </div>
                            <div>
                              <label [for]="'term-end-' + year.id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                              <input
                                [id]="'term-end-' + year.id"
                                type="date"
                                formControlName="end_date"
                                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <button
                              type="submit"
                              [disabled]="termForm.invalid || submittingTerm()"
                              class="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-xs font-medium transition-colors">
                              @if (submittingTerm()) {
                                <span class="flex items-center gap-1.5">
                                  <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  Adding...
                                </span>
                              } @else {
                                Add Term
                              }
                            </button>
                            <button
                              type="button"
                              (click)="showTermForm.set(null)"
                              class="px-3 py-1.5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    }

                    <!-- Terms List -->
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
                          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div class="flex items-center gap-3">
                              <lucide-icon
                                [img]="term.is_current ? CheckCircleIcon : CircleIcon"
                                [size]="16"
                                [class.text-primary-500]="term.is_current"
                                [class.text-slate-300]="!term.is_current"></lucide-icon>
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
                                <button
                                  (click)="setCurrentTerm(term, year)"
                                  class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors">
                                  Set Current
                                </button>
                              }
                              <button
                                (click)="deleteTerm(term, year)"
                                class="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                [attr.aria-label]="'Delete ' + term.name">
                                <lucide-icon [img]="TrashIcon" [size]="14"></lucide-icon>
                              </button>
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
      }
    </div>
  `,
})
export class AcademicYearList implements OnInit {
    private readonly academicYearService = inject(AcademicYearService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly CalendarIcon = Calendar;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronUpIcon = ChevronUp;
    readonly CheckCircleIcon = CheckCircle;
    readonly CircleIcon = Circle;

    // State
    readonly years = signal<YearWithTerms[]>([]);
    readonly loading = signal(false);
    readonly submittingYear = signal(false);
    readonly submittingTerm = signal(false);
    readonly showYearForm = signal(false);
    readonly showTermForm = signal<number | null>(null);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

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
        this.error.set(null);
        this.academicYearService.getAcademicYears({ per_page: 50 }).subscribe({
            next: (res) => {
                this.years.set(res.data.map(y => ({ ...y, expanded: y.is_current, loadingTerms: false })));
                // Auto-load terms for the current year
                const current = this.years().find(y => y.is_current);
                if (current) this.loadTermsForYear(current);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load academic years.');
                this.loading.set(false);
            },
        });
    }

    toggleExpanded(year: YearWithTerms): void {
        this.years.update(list => list.map(y => {
            if (y.id !== year.id) return y;
            const newExpanded = !y.expanded;
            if (newExpanded && !y.terms) {
                this.loadTermsForYear({ ...y, expanded: newExpanded });
            }
            return { ...y, expanded: newExpanded };
        }));
        if (!year.expanded && !year.terms) {
            this.loadTermsForYear(year);
        }
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

    onCreateYear(): void {
        if (this.yearForm.invalid) {
            this.yearForm.markAllAsTouched();
            return;
        }
        this.submittingYear.set(true);
        this.academicYearService.createAcademicYear(this.yearForm.value).subscribe({
            next: () => {
                this.submittingYear.set(false);
                this.showYearForm.set(false);
                this.yearForm.reset();
                this.successMessage.set('Academic year created successfully.');
                this.loadYears();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to create academic year.');
                this.submittingYear.set(false);
            },
        });
    }

    setCurrent(year: AcademicYear): void {
        this.academicYearService.setCurrent(year.id).subscribe({
            next: () => {
                this.successMessage.set(`"${year.name}" set as the current academic year.`);
                this.loadYears();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => this.error.set(err?.error?.message ?? 'Failed to set current year.'),
        });
    }

    deleteYear(year: AcademicYear): void {
        if (!confirm(`Delete academic year "${year.name}"? This cannot be undone.`)) return;
        this.academicYearService.deleteAcademicYear(year.id).subscribe({
            next: () => {
                this.successMessage.set('Academic year deleted.');
                this.loadYears();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete year.'),
        });
    }

    onCreateTerm(yearId: number): void {
        if (this.termForm.invalid) {
            this.termForm.markAllAsTouched();
            return;
        }
        this.submittingTerm.set(true);
        this.academicYearService.createTerm(yearId, this.termForm.value).subscribe({
            next: () => {
                this.submittingTerm.set(false);
                this.showTermForm.set(null);
                this.termForm.reset();
                this.successMessage.set('Term created successfully.');
                const year = this.years().find(y => y.id === yearId);
                if (year) this.loadTermsForYear(year);
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to create term.');
                this.submittingTerm.set(false);
            },
        });
    }

    setCurrentTerm(term: AcademicTerm, year: YearWithTerms): void {
        this.academicYearService.setCurrentTerm(term.id).subscribe({
            next: () => {
                this.successMessage.set(`"${term.name}" set as current term.`);
                this.loadTermsForYear(year);
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => this.error.set(err?.error?.message ?? 'Failed to set current term.'),
        });
    }

    deleteTerm(term: AcademicTerm, year: YearWithTerms): void {
        if (!confirm(`Delete term "${term.name}"?`)) return;
        this.academicYearService.deleteTerm(term.id).subscribe({
            next: () => {
                this.successMessage.set('Term deleted.');
                this.loadTermsForYear(year);
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete term.'),
        });
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
