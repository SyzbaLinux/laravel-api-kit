import { Component, ChangeDetectionStrategy, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, BookMarked } from 'lucide-angular';
import { ClassService } from '../services/class.service';
import { DepartmentService } from '../services/department.service';
import { SchoolClass, User } from '../../../core/models/school-admin.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ZbModal } from '../../../shared/components/ui/zb-modal';
import { ZbSelect, SelectOption } from '../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../shared/components/ui/zb-button';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-assign-subject-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbModal, ZbSelect, ZbButton],
    template: `
    <zb-modal [title]="'Assign: ' + subjectName()" [icon]="BookMarkedIcon" size="md" (close)="onClose.emit()">
      <div class="px-6 py-5 space-y-4">
        @if (loading()) {
          <div class="flex items-center justify-center py-8">
            <div class="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (availableClassOptions().length === 0) {
          <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            This subject is already assigned to all classes.
          </p>
          <div class="flex justify-end">
            <zb-button variant="outline" type="button" (clicked)="onClose.emit()">Close</zb-button>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="space-y-4">
              <zb-select
                formControlName="school_class_id"
                label="Class"
                placeholderOption="— Select a class —"
                [options]="availableClassOptions()"
                [required]="true" />

              <zb-select
                formControlName="teacher_id"
                label="Teacher (optional)"
                placeholderOption="— No teacher assigned —"
                [options]="teacherOptions()" />

              @if (errorMessage()) {
                <p class="text-sm text-red-600 dark:text-red-400" role="alert">{{ errorMessage() }}</p>
              }

              <div class="flex items-center justify-end gap-2 pt-2">
                <zb-button variant="outline" type="button" (clicked)="onClose.emit()">Cancel</zb-button>
                <zb-button variant="primary" type="submit" [loading]="saving()" [disabled]="form.invalid">
                  Assign to Class
                </zb-button>
              </div>
            </div>
          </form>
        }
      </div>
    </zb-modal>
  `,
})
export class AssignSubjectModal implements OnInit {
    readonly subjectId = input.required<number>();
    readonly subjectName = input<string>('');
    readonly onClose = output<void>();
    readonly onAssigned = output<void>();

    private readonly classService = inject(ClassService);
    private readonly departmentService = inject(DepartmentService);
    private readonly http = inject(HttpClient);
    private readonly fb = inject(FormBuilder);

    readonly BookMarkedIcon = BookMarked;

    readonly allClasses = signal<SchoolClass[]>([]);
    readonly assignedClassIds = signal<Set<number>>(new Set());
    readonly teacherOptions = signal<SelectOption[]>([]);
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly errorMessage = signal('');

    /** Classes not yet assigned to this subject */
    readonly availableClassOptions = computed<SelectOption[]>(() => {
        const assigned = this.assignedClassIds();
        return this.allClasses()
            .filter(c => !assigned.has(c.id))
            .map(c => ({ value: String(c.id), label: c.name }));
    });

    readonly form = this.fb.group({
        school_class_id: ['', Validators.required],
        teacher_id: [''],
    });

    ngOnInit(): void {
        this.loading.set(true);
        forkJoin([
            this.classService.getClasses({ per_page: 100 }),
            this.http.get<{ data: { classes: SchoolClass[] } }>(`${environment.apiUrl}/subjects/${this.subjectId()}`),
            this.departmentService.getTeachers({ per_page: 100 }),
        ]).subscribe({
            next: ([classesRes, subjectRes, teachersRes]) => {
                this.allClasses.set(classesRes.data.data);
                this.assignedClassIds.set(new Set((subjectRes.data.classes ?? []).map((c: SchoolClass) => c.id)));
                this.teacherOptions.set(teachersRes.data.data.map((t: User) => ({ value: String(t.id), label: t.name })));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const classId = Number(this.form.value.school_class_id);
        const teacherId = this.form.value.teacher_id ? Number(this.form.value.teacher_id) : null;

        this.saving.set(true);
        this.errorMessage.set('');

        this.http.post(`${environment.apiUrl}/subjects/${this.subjectId()}/assign-to-class`, {
            school_class_id: classId,
            teacher_id: teacherId,
        }).subscribe({
            next: () => {
                this.saving.set(false);
                this.onAssigned.emit();
                this.onClose.emit();
            },
            error: (err) => {
                this.saving.set(false);
                this.errorMessage.set(err?.error?.message ?? 'Failed to assign subject to class.');
            },
        });
    }
}
