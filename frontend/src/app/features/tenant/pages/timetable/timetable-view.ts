import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, X, Clock, AlertTriangle } from 'lucide-angular';
import { TimetableService } from '../../services/timetable.service';
import { ClassService } from '../../services/class.service';
import { SubjectService } from '../../services/subject.service';
import { AcademicYearService } from '../../services/academic-year.service';
import { Timetable, SchoolClass, Subject, AcademicTerm } from '../../../../core/models/school-admin.models';

const DAYS = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
] as const;

const TIME_SLOTS = [
    '07:00', '07:45', '08:30', '09:15', '10:00', '10:45',
    '11:30', '12:15', '13:00', '13:45', '14:30', '15:15',
    '16:00', '16:45',
];

@Component({
    selector: 'app-timetable-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Timetable</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage class timetables</p>
        </div>
        <button
          (click)="showForm.set(!showForm())"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add timetable period">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Period
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

      <!-- Filters -->
      <div class="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="filter-class" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
            <select
              id="filter-class"
              [value]="selectedClassId()"
              (change)="onClassChange($event)"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              <option value="">Select a class...</option>
              @for (cls of classes(); track cls.id) {
                <option [value]="cls.id">{{ cls.name }} ({{ cls.grade_level }})</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-term" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Term</label>
            <select
              id="filter-term"
              [value]="selectedTermId()"
              (change)="onTermChange($event)"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              <option value="">Select a term...</option>
              @for (term of terms(); track term.id) {
                <option [value]="term.id">{{ term.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Add Period Form -->
      @if (showForm()) {
        <div class="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Add Timetable Period</h2>
            <button
              (click)="showForm.set(false)"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <!-- Conflict warnings -->
          @if (conflicts().length > 0) {
            <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div class="flex items-start gap-2">
                <lucide-icon [img]="AlertTriangleIcon" [size]="16" class="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Scheduling Conflicts Detected</p>
                  @for (conflict of conflicts(); track $index) {
                    <p class="text-xs text-amber-600 dark:text-amber-400">{{ conflict.message }}</p>
                  }
                </div>
              </div>
            </div>
          }

          <form [formGroup]="periodForm" (ngSubmit)="onAddPeriod()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Class -->
              <div>
                <label for="period-class" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-class"
                  formControlName="school_class_id"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option [ngValue]="null">Select class...</option>
                  @for (cls of classes(); track cls.id) {
                    <option [ngValue]="cls.id">{{ cls.name }}</option>
                  }
                </select>
              </div>

              <!-- Subject -->
              <div>
                <label for="period-subject" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-subject"
                  formControlName="subject_id"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option [ngValue]="null">Select subject...</option>
                  @for (subject of subjects(); track subject.id) {
                    <option [ngValue]="subject.id">{{ subject.name }}</option>
                  }
                </select>
              </div>

              <!-- Term -->
              <div>
                <label for="period-term" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Term <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-term"
                  formControlName="academic_term_id"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option [ngValue]="null">Select term...</option>
                  @for (term of terms(); track term.id) {
                    <option [ngValue]="term.id">{{ term.name }}</option>
                  }
                </select>
              </div>

              <!-- Day of Week -->
              <div>
                <label for="period-day" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Day <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-day"
                  formControlName="day_of_week"
                  (change)="checkConflicts()"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option [ngValue]="null">Select day...</option>
                  @for (day of days; track day.value) {
                    <option [ngValue]="day.value">{{ day.label }}</option>
                  }
                </select>
              </div>

              <!-- Start Time -->
              <div>
                <label for="period-start" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Time <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-start"
                  formControlName="start_time"
                  (change)="checkConflicts()"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option value="">Select start time...</option>
                  @for (slot of timeSlots; track slot) {
                    <option [value]="slot">{{ slot }}</option>
                  }
                </select>
              </div>

              <!-- End Time -->
              <div>
                <label for="period-end" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Time <span class="text-red-500">*</span>
                </label>
                <select
                  id="period-end"
                  formControlName="end_time"
                  (change)="checkConflicts()"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option value="">Select end time...</option>
                  @for (slot of timeSlots; track slot) {
                    <option [value]="slot">{{ slot }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                [disabled]="periodForm.invalid || submitting()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium">
                @if (submitting()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                } @else {
                  Add Period
                }
              </button>
              <button
                type="button"
                (click)="showForm.set(false)"
                class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Timetable Grid -->
      @if (!selectedClassId() || !selectedTermId()) {
        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <lucide-icon [img]="ClockIcon" [size]="28" class="text-slate-400"></lucide-icon>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Select a class and term</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Choose a class and term above to view the timetable.</p>
        </div>
      } @else if (loadingTimetable()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading timetable">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Weekly Grid -->
        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[700px]" aria-label="Weekly timetable">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Time</th>
                  @for (day of days; track day.value) {
                    <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ day.label }}</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (slot of timeSlots; track slot; let last = $last) {
                  @if (!last) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ slot }}</td>
                      @for (day of days; track day.value) {
                        <td class="px-3 py-2">
                          @for (entry of getEntriesForSlot(day.value, slot); track entry.id) {
                            <div class="p-2 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 mb-1">
                              <p class="text-xs font-semibold text-primary-700 dark:text-primary-300 leading-tight">{{ entry.subject?.name }}</p>
                              @if (entry.teacher) {
                                <p class="text-[10px] text-primary-500 dark:text-primary-400 mt-0.5 leading-tight">{{ entry.teacher.name }}</p>
                              }
                              <div class="flex items-center justify-between mt-1">
                                <span class="text-[10px] text-slate-400">{{ entry.start_time }} - {{ entry.end_time }}</span>
                                <button
                                  (click)="deletePeriod(entry)"
                                  class="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                                  [attr.aria-label]="'Remove ' + (entry.subject?.name ?? 'period')">
                                  <lucide-icon [img]="TrashIcon" [size]="10"></lucide-icon>
                                </button>
                              </div>
                            </div>
                          }
                        </td>
                      }
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (timetableEntries().length === 0) {
            <div class="p-12 text-center">
              <lucide-icon [img]="ClockIcon" [size]="24" class="text-slate-300 dark:text-slate-600 mx-auto mb-2"></lucide-icon>
              <p class="text-sm text-slate-500 dark:text-slate-400">No timetable entries for this class and term yet.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TimetableView implements OnInit {
    private readonly timetableService = inject(TimetableService);
    private readonly classService = inject(ClassService);
    private readonly subjectService = inject(SubjectService);
    private readonly academicYearService = inject(AcademicYearService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly ClockIcon = Clock;
    readonly AlertTriangleIcon = AlertTriangle;

    readonly days = DAYS;
    readonly timeSlots = TIME_SLOTS;

    // State
    readonly timetableEntries = signal<Timetable[]>([]);
    readonly classes = signal<SchoolClass[]>([]);
    readonly subjects = signal<Subject[]>([]);
    readonly terms = signal<AcademicTerm[]>([]);
    readonly conflicts = signal<Array<{ message: string }>>([]);
    readonly loading = signal(false);
    readonly loadingTimetable = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly selectedClassId = signal<number | null>(null);
    readonly selectedTermId = signal<number | null>(null);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly periodForm = this.fb.group({
        school_class_id: [null as number | null, Validators.required],
        subject_id: [null as number | null, Validators.required],
        academic_term_id: [null as number | null, Validators.required],
        day_of_week: [null as number | null, Validators.required],
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
        teacher_id: [null as number | null],
    });

    ngOnInit(): void {
        this.loadClasses();
        this.loadSubjects();
        this.loadTerms();
    }

    loadClasses(): void {
        this.classService.getClasses({ per_page: 200 }).subscribe({
            next: (res) => this.classes.set(res.data),
            error: () => {},
        });
    }

    loadSubjects(): void {
        this.subjectService.getSubjects({ per_page: 200 }).subscribe({
            next: (res) => this.subjects.set(res.data),
            error: () => {},
        });
    }

    loadTerms(): void {
        // Load terms from all academic years
        this.academicYearService.getAcademicYears({ per_page: 50 }).subscribe({
            next: (res) => {
                const allTerms: AcademicTerm[] = [];
                res.data.forEach(year => {
                    if (year.terms) allTerms.push(...year.terms);
                });
                this.terms.set(allTerms);
                // If no terms, try fetching separately for each year
                if (allTerms.length === 0 && res.data.length > 0) {
                    res.data.forEach(year => {
                        this.academicYearService.getTerms(year.id).subscribe({
                            next: (termRes) => this.terms.update(t => [...t, ...termRes.data]),
                            error: () => {},
                        });
                    });
                }
            },
            error: () => {},
        });
    }

    loadTimetable(): void {
        const classId = this.selectedClassId();
        const termId = this.selectedTermId();
        if (!classId || !termId) return;

        this.loadingTimetable.set(true);
        this.timetableService.getTimetables({
            'filter[school_class_id]': classId,
            'filter[academic_term_id]': termId,
            per_page: 200,
        }).subscribe({
            next: (res) => {
                this.timetableEntries.set(res.data);
                this.loadingTimetable.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load timetable.');
                this.loadingTimetable.set(false);
            },
        });
    }

    onClassChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const val = target.value ? Number(target.value) : null;
        this.selectedClassId.set(val);
        this.loadTimetable();
    }

    onTermChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const val = target.value ? Number(target.value) : null;
        this.selectedTermId.set(val);
        this.loadTimetable();
    }

    getEntriesForSlot(day: number, startTime: string): Timetable[] {
        return this.timetableEntries().filter(
            e => e.day_of_week === day && e.start_time === startTime
        );
    }

    checkConflicts(): void {
        const val = this.periodForm.value;
        if (!val.school_class_id || !val.day_of_week || !val.start_time || !val.end_time) {
            this.conflicts.set([]);
            return;
        }
        this.timetableService.checkConflicts(val).subscribe({
            next: (res) => {
                this.conflicts.set(res.has_conflicts ? res.conflicts : []);
            },
            error: () => this.conflicts.set([]),
        });
    }

    onAddPeriod(): void {
        if (this.periodForm.invalid) {
            this.periodForm.markAllAsTouched();
            return;
        }
        this.submitting.set(true);
        this.error.set(null);

        this.timetableService.createTimetable(this.periodForm.value).subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.periodForm.reset();
                this.conflicts.set([]);
                this.successMessage.set('Period added successfully.');
                this.loadTimetable();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to add period.');
                this.submitting.set(false);
            },
        });
    }

    deletePeriod(entry: Timetable): void {
        if (!confirm('Remove this period from the timetable?')) return;
        this.timetableService.deleteTimetable(entry.id).subscribe({
            next: () => {
                this.successMessage.set('Period removed.');
                this.loadTimetable();
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => this.error.set(err?.error?.message ?? 'Failed to remove period.'),
        });
    }
}
