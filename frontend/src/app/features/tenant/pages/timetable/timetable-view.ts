import {
    Component, ChangeDetectionStrategy, OnInit, inject, signal, computed,
    ChangeDetectorRef, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, AlertTriangle, Clock } from 'lucide-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TimetableService } from '../../services/timetable.service';
import { SubjectService } from '../../services/subject.service';
import { DepartmentService } from '../../services/department.service';
import { Timetable, Subject, User } from '../../../../core/models/school-admin.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';

// Fixed reference Monday — all timetable entries are mapped onto this week
const REFERENCE_MONDAY = '2024-01-01';

const DAYS: SelectOption[] = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
];

const TIME_SLOTS = [
    '07:00', '07:45', '08:30', '09:15', '10:00', '10:45',
    '11:30', '12:15', '13:00', '13:45', '14:30', '15:15',
    '16:00',
];

const TIME_OPTIONS: SelectOption[] = TIME_SLOTS.map(t => ({ value: t, label: t }));

function entryToEvent(entry: Timetable): EventInput {
    const day = entry.day_of_week; // 1=Mon
    const date = new Date('2024-01-01');
    date.setDate(date.getDate() + (day - 1));
    const dateStr = date.toISOString().slice(0, 10);
    return {
        id: String(entry.id),
        title: entry.subject?.name ?? 'Period',
        start: `${dateStr}T${entry.start_time}`,
        end: `${dateStr}T${entry.end_time}`,
        extendedProps: { teacher: entry.teacher?.name ?? null, entryId: entry.id },
        backgroundColor: 'rgb(var(--color-primary-600) / 1)',
        borderColor: 'rgb(var(--color-primary-700) / 1)',
    };
}

@Component({
    selector: 'app-timetable-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, FullCalendarModule, ZbModal, ZbSelect, ZbButton],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <button
            (click)="goBack()"
            class="p-2 rounded-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Back to selector">
            <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Timetable</h1>
            @if (className() || termName()) {
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {{ className() }}@if (className() && termName()) { — }{{ termName() }}
              </p>
            }
          </div>
        </div>
        <zb-button variant="primary" (clicked)="openModal()">Add Period</zb-button>
      </div>

      <!-- Calendar -->
      @if (isBrowser) {
        @if (loading()) {
          <div class="flex items-center justify-center py-24" role="status" aria-label="Loading timetable">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <full-calendar [options]="calendarOptions()" deepChangeDetection="true"></full-calendar>
          </div>
        }
      }
    </div>

    <!-- Add Period Modal -->
    @if (showModal()) {
      <zb-modal title="Add Period" [icon]="ClockIcon" size="md" (close)="closeModal()">
        <div class="px-6 py-5 space-y-4">

          @if (conflicts().length > 0) {
            <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm">
              <div class="flex items-start gap-2">
                <lucide-icon [img]="AlertTriangleIcon" [size]="16" class="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Scheduling Conflicts Detected</p>
                  @for (conflict of conflicts(); track $index) {
                    <p class="text-xs text-amber-600 dark:text-amber-400">{{ conflict }}</p>
                  }
                </div>
              </div>
            </div>
          }

          <form [formGroup]="periodForm" (ngSubmit)="onAddPeriod()" novalidate class="space-y-4">
            <zb-select
              formControlName="subject_id"
              label="Subject"
              placeholderOption="— Select subject —"
              [options]="subjectOptions()"
              [required]="true" />

            <zb-select
              formControlName="teacher_id"
              label="Teacher (optional)"
              placeholderOption="— No teacher —"
              [options]="teacherOptions()" />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <zb-select
                formControlName="day_of_week"
                label="Day"
                placeholderOption="— Day —"
                [options]="dayOptions"
                [required]="true" />

              <zb-select
                formControlName="start_time"
                label="Start"
                placeholderOption="— Start —"
                [options]="timeOptions"
                [required]="true" />

              <zb-select
                formControlName="end_time"
                label="End"
                placeholderOption="— End —"
                [options]="timeOptions"
                [required]="true" />
            </div>

            @if (formError()) {
              <p class="text-sm text-red-600 dark:text-red-400" role="alert">{{ formError() }}</p>
            }

            <div class="flex items-center justify-end gap-2 pt-2">
              <zb-button variant="outline" type="button" (clicked)="closeModal()">Cancel</zb-button>
              <zb-button variant="primary" type="submit" [loading]="submitting()" [disabled]="periodForm.invalid">
                Add Period
              </zb-button>
            </div>
          </form>
        </div>
      </zb-modal>
    }
  `,
})
export class TimetableView implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly timetableService = inject(TimetableService);
    private readonly subjectService = inject(SubjectService);
    private readonly departmentService = inject(DepartmentService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly platformId = inject(PLATFORM_ID);

    readonly ArrowLeftIcon = ArrowLeft;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly ClockIcon = Clock;
    readonly dayOptions = DAYS;
    readonly timeOptions = TIME_OPTIONS;
    readonly isBrowser = isPlatformBrowser(this.platformId);

    readonly classId = signal(0);
    readonly termId = signal(0);
    readonly className = signal('');
    readonly termName = signal('');

    readonly timetableEntries = signal<Timetable[]>([]);
    readonly subjects = signal<Subject[]>([]);
    readonly teachers = signal<User[]>([]);
    readonly loading = signal(true);
    readonly submitting = signal(false);
    readonly showModal = signal(false);
    readonly formError = signal('');
    readonly conflicts = signal<string[]>([]);

    readonly subjectOptions = computed<SelectOption[]>(() =>
        this.subjects().map(s => ({ value: String(s.id), label: s.name }))
    );
    readonly teacherOptions = computed<SelectOption[]>(() =>
        this.teachers().map(t => ({ value: String(t.id), label: t.name }))
    );

    readonly calendarOptions = computed<CalendarOptions>(() => ({
        plugins: [timeGridPlugin],
        initialView: 'timeGridWeek',
        initialDate: REFERENCE_MONDAY,
        headerToolbar: false,
        allDaySlot: false,
        hiddenDays: [0, 6],
        slotMinTime: '07:00:00',
        slotMaxTime: '17:00:00',
        slotDuration: '00:45:00',
        expandRows: true,
        height: 'auto',
        dayHeaderFormat: { weekday: 'long' },
        eventClick: (info) => this.onEventClick(info),
        events: this.timetableEntries().map(entryToEvent),
        eventContent: (arg) => {
            const teacher = arg.event.extendedProps['teacher'];
            return {
                html: `
                  <div class="fc-event-main-frame" style="padding:2px 4px">
                    <div style="font-weight:600;font-size:0.75rem;line-height:1.2">${arg.event.title}</div>
                    ${teacher ? `<div style="font-size:0.65rem;opacity:0.85">${teacher}</div>` : ''}
                    <div style="font-size:0.65rem;opacity:0.7">${arg.timeText}</div>
                  </div>`,
            };
        },
    }));

    readonly periodForm = this.fb.group({
        subject_id: ['', Validators.required],
        teacher_id: [''],
        day_of_week: ['', Validators.required],
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
    });

    ngOnInit(): void {
        const classId = Number(this.route.snapshot.paramMap.get('classId'));
        const termId = Number(this.route.snapshot.paramMap.get('termId'));
        this.classId.set(classId);
        this.termId.set(termId);

        // Load class/term names for display
        const state = this.router.lastSuccessfulNavigation?.extras?.state as Record<string, string> | undefined;
        if (state?.['className']) this.className.set(state['className']);
        if (state?.['termName']) this.termName.set(state['termName']);

        this.loadTimetable();
        this.loadSubjects();
        this.loadTeachers();
    }

    loadTimetable(): void {
        this.loading.set(true);
        this.timetableService.getTimetables({
            class_id: this.classId(),
            term_id: this.termId(),
            per_page: 200,
        }).subscribe({
            next: (res) => {
                this.timetableEntries.set(res.data);
                this.loading.set(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load timetable.');
                this.loading.set(false);
            },
        });
    }

    loadSubjects(): void {
        this.subjectService.getSubjects({ per_page: 200 }).subscribe({
            next: (res) => this.subjects.set(res.data.data),
            error: () => {},
        });
    }

    loadTeachers(): void {
        this.departmentService.getTeachers({ per_page: 200 }).subscribe({
            next: (res) => this.teachers.set(res.data.data),
            error: () => {},
        });
    }

    openModal(): void {
        this.periodForm.reset();
        this.conflicts.set([]);
        this.formError.set('');
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.conflicts.set([]);
        this.formError.set('');
    }

    onAddPeriod(): void {
        if (this.periodForm.invalid) {
            this.periodForm.markAllAsTouched();
            return;
        }

        const v = this.periodForm.value;
        const payload = {
            school_class_id: this.classId(),
            subject_id: Number(v.subject_id),
            academic_term_id: this.termId(),
            teacher_id: v.teacher_id ? Number(v.teacher_id) : null,
            day_of_week: Number(v.day_of_week),
            start_time: v.start_time,
            end_time: v.end_time,
        };

        this.submitting.set(true);
        this.formError.set('');

        this.timetableService.createTimetable(payload).subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success('Period added successfully.');
                this.loadTimetable();
            },
            error: (err) => {
                this.submitting.set(false);
                const conflicts = err?.error?.data?.conflicts as string[] | undefined;
                if (conflicts?.length) this.conflicts.set(conflicts);
                this.formError.set(err?.error?.message ?? 'Failed to add period.');
            },
        });
    }

    onEventClick(info: { event: { extendedProps: Record<string, unknown> } }): void {
        const entryId = info.event.extendedProps['entryId'] as number;
        this.confirmDelete(entryId);
    }

    async confirmDelete(entryId: number): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Remove Period',
            message: 'Remove this period from the timetable?',
            confirmText: 'Remove',
            type: 'danger',
        });
        if (!confirmed) return;

        this.timetableService.deleteTimetable(entryId).subscribe({
            next: () => {
                this.toast.success('Period removed.');
                this.loadTimetable();
            },
            error: (err) => this.toast.error('Error', err?.error?.message ?? 'Failed to remove period.'),
        });
    }

    goBack(): void {
        this.router.navigate(['/tenant/timetable']);
    }
}
