import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Users } from 'lucide-angular';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, MarkEntry as MarkEntryItem } from '../../../../core/models/school-admin.models';
import { ZbButton } from '../../../../shared/components/ui/zb-button';

import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-mark-entry',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, FormsModule, LucideAngularModule, ZbButton, RouterLink],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Back link -->
      <a routerLink="/tenant/assessments" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-6 transition-colors">
        <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
        Back to Assessments
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (assessment()) {
        <!-- Assessment Info -->
        <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 mb-6">
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ assessment()!.title }}</h1>
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Subject: <strong class="text-slate-700 dark:text-slate-300">{{ assessment()!.subject?.name ?? '—' }}</strong></span>
                <span>Type: <strong class="text-slate-700 dark:text-slate-300">{{ assessment()!.assessment_type?.name ?? '—' }}</strong></span>
                <span>Max Score: <strong class="text-slate-700 dark:text-slate-300">{{ assessment()!.max_score }}</strong></span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <zb-button variant="outline" (clicked)="quickFill()" aria-label="Mark all students with same score">Mark All</zb-button>
              <zb-button [iconLeft]="SaveIcon" (clicked)="saveAll()" [loading]="saving()" [disabled]="marksForm.invalid">Save All</zb-button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Students</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ totalStudents() }}</p>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Average</p>
            <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ averageScore() }}</p>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Highest</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ highestScore() }}</p>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Pass Rate</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ passRate() }}%</p>
          </div>
        </div>

        <!-- Mark Entry Table -->
        <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <lucide-icon [img]="UsersIcon" [size]="16" class="text-slate-500"></lucide-icon>
            <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Marks</h2>
            <span class="ml-auto text-xs text-slate-400">{{ marks().length }} students</span>
          </div>

          <form [formGroup]="marksForm">
            <div class="overflow-x-auto">
              <table class="w-full" aria-label="Student marks entry">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">#</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Student</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-36">Score (max {{ assessment()!.max_score }})</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Comment</th>
                  </tr>
                </thead>
                <tbody formArrayName="marks">
                  @for (markGroup of marksArray.controls; track $index) {
                    <tr [formGroupName]="$index" class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td class="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{{ $index + 1 }}</td>
                      <td class="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white">
                        {{ marks()[$index].student_name }}
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          formControlName="score"
                          [min]="0"
                          [max]="assessment()!.max_score"
                          [attr.aria-label]="'Score for ' + marks()[$index].student_name"
                          class="w-28 px-3 py-1.5 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors" />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          formControlName="comment"
                          placeholder="Optional comment..."
                          [attr.aria-label]="'Comment for ' + marks()[$index].student_name"
                          class="w-full px-3 py-1.5 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors" />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </form>

          @if (marks().length === 0) {
            <div class="py-12 text-center text-slate-400">
              <lucide-icon [img]="UsersIcon" [size]="32" class="mx-auto mb-3 opacity-40"></lucide-icon>
              <p class="text-sm">No students enrolled in this class.</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Quick Fill Modal -->
    @if (showQuickFill()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Quick fill marks">
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 w-80">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Quick Fill All Scores</h3>
          <input
            type="number"
            [(ngModel)]="quickFillValue"
            [min]="0"
            [max]="assessment()?.max_score ?? 100"
            placeholder="Enter score..."
            aria-label="Quick fill score value"
            class="w-full px-3 py-2 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 mb-4" />
          <div class="flex gap-3 justify-end">
            <zb-button variant="outline" (clicked)="showQuickFill.set(false)">Cancel</zb-button>
            <zb-button variant="primary" (clicked)="applyQuickFill()">Apply</zb-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MarkEntry implements OnInit {
    private readonly assessmentService = inject(AssessmentService);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);

    readonly ArrowLeftIcon = ArrowLeft;
    readonly SaveIcon = Save;
    readonly UsersIcon = Users;

    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly showQuickFill = signal(false);
    readonly assessment = signal<Assessment | null>(null);
    readonly marks = signal<MarkEntryItem[]>([]);

    quickFillValue = 0;

    readonly marksForm = this.fb.group({
        marks: this.fb.array([]),
    });

    get marksArray(): FormArray {
        return this.marksForm.get('marks') as FormArray;
    }

    readonly totalStudents = computed(() => this.marks().length);

    readonly averageScore = computed(() => {
        const controls = this.marksArray.controls;
        const scored = controls.filter(c => c.get('score')?.value !== null && c.get('score')?.value !== '');
        if (scored.length === 0) return '—';
        const sum = scored.reduce((acc, c) => acc + Number(c.get('score')?.value ?? 0), 0);
        return (sum / scored.length).toFixed(1);
    });

    readonly highestScore = computed(() => {
        const controls = this.marksArray.controls;
        const scores = controls
            .map(c => Number(c.get('score')?.value ?? null))
            .filter(s => !isNaN(s));
        return scores.length > 0 ? Math.max(...scores).toString() : '—';
    });

    readonly passRate = computed(() => {
        const max = this.assessment()?.max_score ?? 100;
        const passThreshold = max * 0.5;
        const controls = this.marksArray.controls;
        const scored = controls.filter(c => {
            const v = c.get('score')?.value;
            return v !== null && v !== '';
        });
        if (scored.length === 0) return 0;
        const passed = scored.filter(c => Number(c.get('score')?.value ?? 0) >= passThreshold).length;
        return Math.round((passed / scored.length) * 100);
    });

    ngOnInit(): void {
        const assessmentId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadMarks(assessmentId);
    }

    loadMarks(assessmentId: number): void {
        this.loading.set(true);

        this.assessmentService.getMarks(assessmentId).subscribe({
            next: res => {
                const { assessment, marks } = res.data;
                this.assessment.set(assessment);
                this.marks.set(marks);

                // Build form array
                const array = this.fb.array(
                    marks.map(m => this.fb.group({
                        student_id: [m.student_id],
                        score: [m.score, [Validators.min(0)]],
                        comment: [m.comment ?? ''],
                    }))
                );

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.marksForm.setControl('marks', array as any);
                this.loading.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load marks.');
                this.loading.set(false);
            },
        });
    }

    quickFill(): void {
        this.quickFillValue = 0;
        this.showQuickFill.set(true);
    }

    applyQuickFill(): void {
        const val = this.quickFillValue;
        this.marksArray.controls.forEach(c => c.get('score')?.setValue(val));
        this.showQuickFill.set(false);
    }

    saveAll(): void {
        if (this.marksForm.invalid) return;

        const assessmentId = this.assessment()?.id;
        if (!assessmentId) return;

        this.saving.set(true);

        const rawMarks = this.marksArray.value as Array<{ student_id: number; score: number | null; comment: string }>;
        const validMarks = rawMarks
            .filter(m => m.score !== null && m.score !== undefined && String(m.score) !== '')
            .map(m => ({ student_id: m.student_id, score: Number(m.score), comment: m.comment || null }));

        this.assessmentService.bulkSaveMarks(assessmentId, validMarks).subscribe({
            next: () => {
                this.saving.set(false);
                this.toast.success('Marks saved successfully.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save marks.');
                this.saving.set(false);
            },
        });
    }
}
