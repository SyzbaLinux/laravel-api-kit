import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideAngularModule, CalendarDays } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import { AcademicYearService } from '../../services/academic-year.service';
import { SchoolClass, AcademicTerm, AcademicYear } from '../../../../core/models/school-admin.models';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';

@Component({
    selector: 'app-timetable-selector',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbSelect, ZbButton],
    template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <!-- Icon + heading -->
      <div class="flex flex-col items-center mb-8 text-center">
        <div class="w-16 h-16 rounded-sm bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
          <lucide-icon [img]="CalendarIcon" [size]="32" class="text-primary-600 dark:text-primary-400"></lucide-icon>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Class Timetable</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a class and term to view its weekly schedule</p>
      </div>

      <!-- Selection card -->
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <zb-select
          label="Class"
          placeholderOption="— Select a class —"
          [options]="classOptions()"
          [formControl]="classControl" />

        <zb-select
          label="Term"
          placeholderOption="— Select a term —"
          [options]="termOptions()"
          [formControl]="termControl" />

        <zb-button
          variant="primary"
          [fullWidth]="true"
          [disabled]="!selectedClassId() || !selectedTermId()"
          (clicked)="viewTimetable()">
          View Timetable
        </zb-button>
      </div>
    </div>
  `,
})
export class TimetableSelector implements OnInit {
    private readonly router = inject(Router);
    private readonly classService = inject(ClassService);
    private readonly academicYearService = inject(AcademicYearService);

    readonly CalendarIcon = CalendarDays;

    readonly classControl = new FormControl('');
    readonly termControl = new FormControl('');
    readonly selectedClassId = signal('');
    readonly selectedTermId = signal('');

    readonly classes = signal<SchoolClass[]>([]);
    readonly terms = signal<AcademicTerm[]>([]);

    readonly classOptions = computed<SelectOption[]>(() =>
        this.classes().map(c => ({ value: String(c.id), label: `${c.name} (${c.grade_level})` }))
    );
    readonly termOptions = computed<SelectOption[]>(() =>
        this.terms().map(t => ({ value: String(t.id), label: t.name }))
    );

    ngOnInit(): void {
        this.classControl.valueChanges.subscribe(v => this.selectedClassId.set(v ?? ''));
        this.termControl.valueChanges.subscribe(v => this.selectedTermId.set(v ?? ''));

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
        const classId = this.selectedClassId();
        const termId = this.selectedTermId();
        if (!classId || !termId) return;

        const cls = this.classes().find(c => c.id === Number(classId));
        const term = this.terms().find(t => t.id === Number(termId));

        this.router.navigate(['/tenant/timetable', classId, termId], {
            state: { className: cls?.name ?? '', termName: term?.name ?? '' },
        });
    }
}
