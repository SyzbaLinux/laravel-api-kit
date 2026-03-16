import {
    Component, ChangeDetectionStrategy, OnInit, inject, signal, computed,
    ChangeDetectorRef, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, AlertTriangle, Clock, Plus } from 'lucide-angular';
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

// Each subject gets a colour from this palette based on subject_id % length
const SUBJECT_PALETTE = [
    { bg: '#6366f1', dark: '#4f46e5' }, // indigo
    { bg: '#8b5cf6', dark: '#7c3aed' }, // violet
    { bg: '#ec4899', dark: '#db2777' }, // pink
    { bg: '#f97316', dark: '#ea580c' }, // orange
    { bg: '#10b981', dark: '#059669' }, // emerald
    { bg: '#14b8a6', dark: '#0d9488' }, // teal
    { bg: '#3b82f6', dark: '#2563eb' }, // blue
    { bg: '#f59e0b', dark: '#d97706' }, // amber
    { bg: '#ef4444', dark: '#dc2626' }, // red
    { bg: '#06b6d4', dark: '#0891b2' }, // cyan
    { bg: '#a855f7', dark: '#9333ea' }, // purple
    { bg: '#84cc16', dark: '#65a30d' }, // lime
];

function subjectColor(subjectId: number) {
    return SUBJECT_PALETTE[subjectId % SUBJECT_PALETTE.length];
}

// Reference week: Monday 2024-01-01. day_of_week 1..5 → Mon..Fri
function toEventDate(dayOfWeek: number): string {
    const d = new Date('2024-01-01');
    d.setDate(d.getDate() + (dayOfWeek - 1));
    return d.toISOString().slice(0, 10);
}

function entryToEvent(entry: Timetable): EventInput {
    const color = subjectColor(entry.subject_id);
    const dateStr = toEventDate(entry.day_of_week);
    return {
        id: String(entry.id),
        title: entry.subject?.name ?? 'Period',
        start: `${dateStr}T${entry.start_time}`,
        end: `${dateStr}T${entry.end_time}`,
        backgroundColor: color.bg,
        borderColor: color.dark,
        textColor: '#ffffff',
        extendedProps: {
            teacher: entry.teacher?.name ?? null,
            entryId: entry.id,
            subjectCode: entry.subject?.code ?? null,
        },
    };
}

const DAYS: SelectOption[] = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
];

const TIME_SLOTS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
];

const TIME_OPTIONS: SelectOption[] = TIME_SLOTS.map(t => ({ value: t, label: t }));

@Component({
    selector: 'app-timetable-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, FullCalendarModule, ZbModal, ZbSelect, ZbButton],
    styles: [`
        :host ::ng-deep {
            .fc {
                font-family: inherit;
            }
            /* Remove default FullCalendar border/shadow wrapper */
            .fc-theme-standard .fc-scrollgrid {
                border: none;
            }
            .fc-theme-standard td,
            .fc-theme-standard th {
                border-color: #e2e8f0;
            }
            /* Day header cells */
            .fc-col-header-cell {
                background: #f8fafc;
                padding: 10px 0 !important;
                border-bottom: 2px solid #e2e8f0 !important;
            }
            .fc-col-header-cell-cushion {
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: #64748b;
                text-decoration: none !important;
                cursor: default;
            }
            /* Time labels */
            .fc-timegrid-slot-label-cushion {
                font-size: 0.7rem;
                font-weight: 600;
                color: #94a3b8;
                letter-spacing: 0.02em;
            }
            .fc-timegrid-slot-label {
                vertical-align: top;
            }
            /* Minor slots (30-min lines) */
            .fc-timegrid-slot-minor {
                border-top-style: dashed !important;
                border-color: #f1f5f9 !important;
            }
            /* Remove today highlight (it's a fixed reference week) */
            .fc-day-today {
                background: transparent !important;
            }
            /* Event block */
            .fc-timegrid-event {
                border-radius: 4px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
                border-width: 0 0 0 3px !important;
            }
            .fc-event-main {
                padding: 0 !important;
            }
            /* Scrollbar */
            .fc-scroller::-webkit-scrollbar {
                width: 4px;
            }
            .fc-scroller::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 2px;
            }
        }
    `],
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
            <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              @if (className()) { {{ className() }} } @else { Timetable }
            </h1>
            @if (termName()) {
              <span class="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-sm border border-primary-100 dark:border-primary-800">
                {{ termName() }}
              </span>
            }
          </div>
        </div>
        <zb-button variant="primary" [iconLeft]="PlusIcon" (clicked)="openModal()">Add Period</zb-button>
      </div>

      <!-- Subject colour legend -->
      @if (subjectLegend().length > 0) {
        <div class="flex flex-wrap gap-2 mb-4">
          @for (item of subjectLegend(); track item.name) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium text-white"
                  [style.background-color]="item.color">
              {{ item.name }}
            </span>
          }
        </div>
      }

      <!-- Calendar -->
      @if (isBrowser) {
        @if (loading()) {
          <div class="flex items-center justify-center py-24" role="status" aria-label="Loading timetable">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <full-calendar [options]="calendarOptions()" [deepChangeDetection]="true"></full-calendar>
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

            <div class="grid grid-cols-3 gap-3">
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
    readonly PlusIcon = Plus;
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

    /** Unique subjects in the current timetable, each with their assigned colour */
    readonly subjectLegend = computed(() => {
        const seen = new Map<number, { name: string; color: string }>();
        for (const entry of this.timetableEntries()) {
            if (entry.subject && !seen.has(entry.subject_id)) {
                seen.set(entry.subject_id, {
                    name: entry.subject.name,
                    color: subjectColor(entry.subject_id).bg,
                });
            }
        }
        return [...seen.values()];
    });

    readonly calendarOptions = computed<CalendarOptions>(() => ({
        plugins: [timeGridPlugin],
        initialView: 'timeGridWeek',
        initialDate: '2024-01-01',
        headerToolbar: false,
        allDaySlot: false,
        hiddenDays: [0, 6],
        slotMinTime: '07:00:00',
        slotMaxTime: '17:00:00',
        slotDuration: '00:30:00',
        slotLabelInterval: '01:00:00',
        expandRows: true,
        height: 'auto',
        dayHeaderFormat: { weekday: 'long' },
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        eventClick: (info) => this.onEventClick(info),
        events: this.timetableEntries().map(entryToEvent),
        eventContent: (arg) => {
            const teacher = arg.event.extendedProps['teacher'] as string | null;
            const code = arg.event.extendedProps['subjectCode'] as string | null;
            const bg = arg.event.backgroundColor;
            return {
                html: `
                  <div style="
                    height:100%;
                    padding:4px 6px;
                    background:${bg};
                    border-left:3px solid ${arg.event.borderColor};
                    border-radius:3px;
                    overflow:hidden;
                    display:flex;
                    flex-direction:column;
                    gap:1px;
                  ">
                    <div style="font-weight:700;font-size:0.72rem;line-height:1.3;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                      ${arg.event.title}${code ? ` <span style="opacity:0.75;font-weight:500">(${code})</span>` : ''}
                    </div>
                    ${teacher ? `<div style="font-size:0.65rem;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${teacher}</div>` : ''}
                    <div style="font-size:0.62rem;color:rgba(255,255,255,0.7);margin-top:auto">${arg.timeText}</div>
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

        const state = this.router.lastSuccessfulNavigation()?.extras?.state as Record<string, string> | undefined;
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
