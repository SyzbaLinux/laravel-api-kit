import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, ClipboardList, ExternalLink } from 'lucide-angular';
import { AssessmentService } from '../../services/assessment.service';
import { AssessmentTypeService } from '../../services/assessment-type.service';
import { AcademicYearService } from '../../services/academic-year.service';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Assessment, AssessmentType, AcademicTerm, AcademicYear, SchoolClass, Subject } from '../../../../core/models/school-admin.models';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbDatepicker } from '../../../../shared/components/ui/zb-datepicker';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-assessment-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, FormsModule, LucideAngularModule, ZbDatatable, ZbModal, ZbInput, ZbSelect, ZbButton, ZbDatepicker],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Assessments</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage assessments and record marks</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openCreateModal()">Add Assessment</zb-button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <zb-select
          label="Filter by Term"
          [options]="termOptions()"
          placeholderOption="All Terms"
          [ngModel]="filterTermId()"
          (ngModelChange)="filterTermId.set($event); loadAssessments()"
          name="filterTerm" />
        <zb-select
          label="Filter by Class"
          [options]="classOptions()"
          placeholderOption="All Classes"
          [ngModel]="filterClassId()"
          (ngModelChange)="filterClassId.set($event); loadAssessments()"
          name="filterClass" />
        <zb-select
          label="Filter by Subject"
          [options]="subjectOptions()"
          placeholderOption="All Subjects"
          [ngModel]="filterSubjectId()"
          (ngModelChange)="filterSubjectId.set($event); loadAssessments()"
          name="filterSubject" />
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading assessments">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <zb-datatable [data]="assessments()" [columns]="columns" [actions]="tableActions" trackBy="id" />
        </div>
      }
    </div>

    <!-- Create / Edit Modal -->
    @if (showModal()) {
      <zb-modal
        [title]="editingId() ? 'Edit Assessment' : 'New Assessment'"
        [icon]="ClipboardListIcon"
        size="lg"
        (close)="closeModal()">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">
          @if (formError()) {
            <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ formError() }}
            </div>
          }

          <zb-input formControlName="title" label="Assessment Title" placeholder="e.g. Term 1 Monthly Test" [required]="true" [error]="titleError()" />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <zb-select formControlName="assessment_type_id" label="Assessment Type" [options]="typeOptions()" placeholderOption="Select type" [required]="true" />
            <zb-select formControlName="academic_term_id" label="Academic Term" [options]="termFormOptions()" placeholderOption="Select term" [required]="true" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <zb-select formControlName="school_class_id" label="Class" [options]="formClassOptions()" placeholderOption="Select class" [required]="true" />
            <zb-select formControlName="subject_id" label="Subject" [options]="formSubjectOptions()" placeholderOption="Select subject" [required]="true" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <zb-input formControlName="max_score" label="Maximum Score" type="number" placeholder="100" [required]="true" />
            <zb-datepicker formControlName="date" label="Date" />
          </div>

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
export class AssessmentList implements OnInit {
    private readonly assessmentService = inject(AssessmentService);
    private readonly assessmentTypeService = inject(AssessmentTypeService);
    private readonly academicYearService = inject(AcademicYearService);
    private readonly teacherService = inject(TeacherService);
    private readonly authService = inject(AuthService);
    private readonly http = inject(HttpClient);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);
    private readonly router = inject(Router);

    readonly PlusIcon = Plus;
    readonly ClipboardListIcon = ClipboardList;
    readonly ExternalLinkIcon = ExternalLink;

    readonly assessments = signal<Assessment[]>([]);
    readonly assessmentTypes = signal<AssessmentType[]>([]);
    readonly terms = signal<AcademicTerm[]>([]);
    readonly classes = signal<SchoolClass[]>([]);
    readonly subjects = signal<Subject[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showModal = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly formError = signal<string | null>(null);

    readonly filterTermId = signal('');
    readonly filterClassId = signal('');
    readonly filterSubjectId = signal('');

    readonly isTeacher = computed(() => this.authService.userRole() === 'teacher');
    readonly teacherAssignments = signal<SchoolClass[]>([]);

    readonly form = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(255)]],
        assessment_type_id: ['', [Validators.required]],
        academic_term_id: ['', [Validators.required]],
        school_class_id: ['', [Validators.required]],
        subject_id: ['', [Validators.required]],
        max_score: [100, [Validators.required, Validators.min(0)]],
        date: [''],
    });

    // Converts the reactive form class control into a signal so formSubjectOptions can react to it
    private readonly formClassId = toSignal(this.form.get('school_class_id')!.valueChanges, { initialValue: '' });

    readonly titleError = computed(() =>
        this.form.get('title')?.invalid && this.form.get('title')?.touched ? 'Title is required' : ''
    );

    readonly termOptions = computed<SelectOption[]>(() =>
        this.terms().map(t => ({ value: String(t.id), label: t.name }))
    );

    readonly termFormOptions = computed<SelectOption[]>(() =>
        this.terms().map(t => ({ value: String(t.id), label: t.name }))
    );

    readonly typeOptions = computed<SelectOption[]>(() =>
        this.assessmentTypes().map(t => ({ value: String(t.id), label: `${t.name} (${t.category === 'continuous_assessment' ? 'CA' : 'Exam'})` }))
    );

    readonly classOptions = computed<SelectOption[]>(() => {
        if (this.isTeacher()) {
            return this.teacherAssignments().map(c => ({ value: String(c.id), label: c.name }));
        }
        return this.classes().map(c => ({ value: String(c.id), label: c.name }));
    });

    readonly subjectOptions = computed<SelectOption[]>(() => {
        if (this.isTeacher()) {
            const classId = this.filterClassId();
            if (!classId) return [];
            const cls = this.teacherAssignments().find(c => String(c.id) === classId);
            return (cls?.subjects ?? []).map(s => ({ value: String(s.id), label: s.name }));
        }
        return this.subjects().map(s => ({ value: String(s.id), label: s.name }));
    });

    readonly formClassOptions = computed<SelectOption[]>(() => {
        if (this.isTeacher()) {
            return this.teacherAssignments().map(c => ({ value: String(c.id), label: c.name }));
        }
        return this.classes().map(c => ({ value: String(c.id), label: c.name }));
    });

    readonly formSubjectOptions = computed<SelectOption[]>(() => {
        if (this.isTeacher()) {
            const classId = this.formClassId() ?? '';
            if (!classId) return [];
            const cls = this.teacherAssignments().find(c => String(c.id) === classId);
            return (cls?.subjects ?? []).map(s => ({ value: String(s.id), label: s.name }));
        }
        return this.subjects().map(s => ({ value: String(s.id), label: s.name }));
    });

    readonly columns: DataTableColumn<Assessment>[] = [
        { key: 'title', label: 'Title', sortable: true, filterable: true },
        { key: 'assessment_type', label: 'Type', formatter: (v) => (v as AssessmentType | undefined)?.name ?? '—' },
        { key: 'subject', label: 'Subject', formatter: (v) => (v as Subject | undefined)?.name ?? '—' },
        { key: 'max_score', label: 'Max Score', formatter: v => String(v ?? 100) },
        { key: 'date', label: 'Date', formatter: v => v ? String(v).substring(0, 10) : '—' },
    ];

    readonly tableActions: DataTableAction<Assessment>[] = [
        { label: 'Enter Marks', variant: 'primary', size: 'sm', callback: a => this.router.navigate(['/tenant/assessments', a.id, 'marks']) },
        { label: 'Edit', variant: 'outline', size: 'sm', callback: a => this.editAssessment(a) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: a => this.deleteAssessment(a) },
    ];

    ngOnInit(): void {
        // Reset subject when class changes (teacher-scoped: subject options change per class)
        this.form.get('school_class_id')!.valueChanges.subscribe(() => {
            if (this.isTeacher()) {
                this.form.patchValue({ subject_id: '' }, { emitEvent: false });
            }
        });
        this.loadReferenceData();
        this.loadAssessments();
    }

    loadReferenceData(): void {
        this.assessmentTypeService.getAssessmentTypes({ per_page: 100 }).subscribe({
            next: res => this.assessmentTypes.set(res.data.data),
            error: () => {},
        });

        // Load academic years then all terms
        this.academicYearService.getAcademicYears({ per_page: 100, include: 'terms' }).subscribe({
            next: (res: any) => {
                const years: AcademicYear[] = res.data.data;
                const allTerms: AcademicTerm[] = years.flatMap(y => y.terms ?? []);
                this.terms.set(allTerms);
            },
            error: () => {},
        });

        const userId = this.authService.currentUser()?.id;
        if (this.isTeacher() && userId) {
            this.teacherService.getTeacherAssignments(userId).subscribe({
                next: res => this.teacherAssignments.set(res.data),
                error: () => {},
            });
        } else {
            this.http.get<any>(`${environment.apiUrl}/classes?per_page=100`).subscribe({
                next: res => this.classes.set(res.data.data),
                error: () => {},
            });

            this.http.get<any>(`${environment.apiUrl}/subjects?per_page=100`).subscribe({
                next: res => this.subjects.set(res.data.data),
                error: () => {},
            });
        }
    }

    loadAssessments(): void {
        this.loading.set(true);
        const params: Record<string, string> = { per_page: '50' };
        if (this.filterTermId()) params['filter[academic_term_id]'] = this.filterTermId();
        if (this.filterClassId()) params['filter[school_class_id]'] = this.filterClassId();
        if (this.filterSubjectId()) params['filter[subject_id]'] = this.filterSubjectId();

        this.assessmentService.getAssessments(params).subscribe({
            next: res => {
                this.assessments.set(res.data.data);
                this.loading.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load assessments.');
                this.loading.set(false);
            },
        });
    }

    openCreateModal(): void {
        this.editingId.set(null);
        const defaultType = this.assessmentTypes()[0];
        this.form.reset({
            title: '',
            assessment_type_id: defaultType ? String(defaultType.id) : '',
            academic_term_id: '',
            school_class_id: '',
            subject_id: '',
            max_score: 100,
            date: '',
        });
        this.formError.set(null);
        this.showModal.set(true);
    }

    editAssessment(a: Assessment): void {
        this.editingId.set(a.id);
        this.form.reset({
            title: a.title,
            assessment_type_id: String(a.assessment_type_id),
            academic_term_id: String(a.academic_term_id),
            school_class_id: String(a.school_class_id),
            subject_id: String(a.subject_id),
            max_score: a.max_score,
            date: a.date ? a.date.substring(0, 10) : '',
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

        const v = this.form.value;
        const payload = {
            title: v.title ?? '',
            assessment_type_id: Number(v.assessment_type_id),
            academic_term_id: Number(v.academic_term_id),
            school_class_id: Number(v.school_class_id),
            subject_id: Number(v.subject_id),
            max_score: Number(v.max_score),
            date: v.date || null,
        };

        const id = this.editingId();
        const req = id
            ? this.assessmentService.updateAssessment(id, payload)
            : this.assessmentService.createAssessment(payload);

        req.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success(id ? 'Assessment updated.' : 'Assessment created.');
                this.loadAssessments();
            },
            error: err => {
                this.formError.set(err?.error?.message ?? 'Failed to save assessment.');
                this.submitting.set(false);
            },
        });
    }

    async deleteAssessment(a: Assessment): Promise<void> {
        const confirmed = await this.alertService.confirm({ title: 'Delete Assessment', message: `Delete "${a.title}"?`, confirmText: 'Delete', type: 'danger' });
        if (!confirmed) return;

        this.assessmentService.deleteAssessment(a.id).subscribe({
            next: () => {
                this.toast.success('Assessment deleted.');
                this.loadAssessments();
            },
            error: err => this.toast.error('Error', err?.error?.message ?? 'Failed to delete assessment.'),
        });
    }
}
