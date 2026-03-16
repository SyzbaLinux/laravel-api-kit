import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { AcademicYearService } from '../../services/academic-year.service';
import { SchoolClass, AcademicTerm, AcademicYear } from '../../../../core/models/school-admin.models';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';

@Component({
    selector: 'app-timetable-selector',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, ZbSelect, ZbButton],
    template: `
    <div class="p-6 lg:p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Timetable</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a class and term to view its timetable</p>
      </div>

      <div class="max-w-lg bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <zb-select
          label="Class"
          placeholderOption="— Select a class —"
          [options]="classOptions()"
          [formControl]="classControl" />

        @if (classControl.value) {
          <zb-select
            label="Term"
            placeholderOption="— Select a term —"
            [options]="termOptions()"
            [formControl]="termControl" />
        }

        <div class="pt-2">
          <zb-button
            variant="primary"
            [disabled]="!classControl.value || !termControl.value"
            (clicked)="viewTimetable()">
            View Timetable
          </zb-button>
        </div>
      </div>
    </div>
  `,
})
export class TimetableSelector implements OnInit {
    private readonly router = inject(Router);
    private readonly classService = inject(ClassService);
    private readonly academicYearService = inject(AcademicYearService);

    readonly classControl = new FormControl('');
    readonly termControl = new FormControl('');

    readonly classes = signal<SchoolClass[]>([]);
    readonly terms = signal<AcademicTerm[]>([]);

    readonly classOptions = computed<SelectOption[]>(() =>
        this.classes().map(c => ({ value: String(c.id), label: `${c.name} (${c.grade_level})` }))
    );
    readonly termOptions = computed<SelectOption[]>(() =>
        this.terms().map(t => ({ value: String(t.id), label: t.name }))
    );

    ngOnInit(): void {
        this.classService.getClasses({ per_page: 200 }).subscribe({
            next: (res) => this.classes.set(res.data.data),
            error: () => {},
        });

        this.academicYearService.getAcademicYears({ per_page: 50 }).subscribe({
            next: (res) => {
                const allTerms: AcademicTerm[] = [];
                res.data.data.forEach((year: AcademicYear) => {
                    if (year.terms) allTerms.push(...year.terms);
                });
                if (allTerms.length > 0) {
                    this.terms.set(allTerms);
                    return;
                }
                res.data.data.forEach((year: AcademicYear) => {
                    this.academicYearService.getTerms(year.id).subscribe({
                        next: (r) => this.terms.update(t => [...t, ...r.data]),
                        error: () => {},
                    });
                });
            },
            error: () => {},
        });
    }

    viewTimetable(): void {
        const classId = this.classControl.value;
        const termId = this.termControl.value;
        if (!classId || !termId) return;

        const cls = this.classes().find(c => c.id === Number(classId));
        const term = this.terms().find(t => t.id === Number(termId));

        this.router.navigate(['/tenant/timetable', classId, termId], {
            state: { className: cls?.name ?? '', termName: term?.name ?? '' },
        });
    }
}
