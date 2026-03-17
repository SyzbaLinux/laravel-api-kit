import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Printer, CheckCircle, Globe, EyeOff, Edit2, X, Check } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ReportCardService } from '../../services/report-card.service';
import { ReportCardDetail, SubjectResult } from '../../../../core/models/school-admin.models';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-report-card-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, ZbButton, RouterLink, FormsModule, TitleCasePipe],
    styles: [`
        @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
        }
    `],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Back + Actions -->
      <div class="flex items-center justify-between mb-6 no-print flex-wrap gap-4">
        <a routerLink="/tenant/report-cards" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to Report Cards
        </a>

        @if (detail()) {
          <div class="flex items-center gap-2 flex-wrap">
            <zb-button variant="outline" [iconLeft]="PrinterIcon" (clicked)="print()">Print</zb-button>

            @if (detail()!.report_card.status === 'draft') {
              <zb-button variant="primary" [iconLeft]="CheckCircleIcon" (clicked)="approve()" [loading]="actionLoading()">Approve</zb-button>
            }

            @if (detail()!.report_card.status === 'approved') {
              <zb-button variant="primary" [iconLeft]="GlobeIcon" (clicked)="publish()" [loading]="actionLoading()">Publish</zb-button>
            }

            @if (detail()!.report_card.status === 'published') {
              <zb-button variant="outline" [iconLeft]="EyeOffIcon" (clicked)="unpublish()" [loading]="actionLoading()">Unpublish</zb-button>
            }
          </div>
        }
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading report card">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (detail()) {
        <!-- Report Card Document -->
        <div class="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

          <!-- Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-800 text-center">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Academic Report Card</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ detail()!.academic_year.name }} — {{ detail()!.term.name }}</p>

            <!-- Status badge -->
            <div class="mt-2 no-print">
              <span [class]="statusBadgeClass()">{{ detail()!.report_card.status | titlecase }}</span>
            </div>
          </div>

          <!-- Student Info -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-slate-200 dark:border-slate-800">
            <div class="p-4 border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-500 dark:text-slate-400">Student Name</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ detail()!.student.name }}</p>
            </div>
            <div class="p-4 border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-500 dark:text-slate-400">Student Number</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ detail()!.student.student_number ?? '—' }}</p>
            </div>
            <div class="p-4 border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-500 dark:text-slate-400">Class</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ detail()!.class.name }}</p>
            </div>
            <div class="p-4">
              <p class="text-xs text-slate-500 dark:text-slate-400">Class Teacher</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ detail()!.class_teacher?.name ?? '—' }}</p>
            </div>
          </div>

          <!-- Subject Results Table -->
          <div class="overflow-x-auto">
            <table class="w-full" aria-label="Subject results">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-20">CA</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-20">Exam</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-20">Final</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-16">Grade</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Teacher Comment</th>
                </tr>
              </thead>
              <tbody>
                @for (result of detail()!.subject_results; track result.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td class="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                      {{ result.subject_name }}
                      <span class="text-xs text-slate-400 ml-1">{{ result.subject_code }}</span>
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">
                      {{ result.ca_score !== null ? result.ca_score!.toFixed(1) + '%' : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">
                      {{ result.exam_score !== null ? result.exam_score!.toFixed(1) + '%' : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      {{ result.final_mark !== null ? result.final_mark!.toFixed(1) + '%' : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (result.grade_letter) {
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-sm text-sm font-bold" [class]="gradeClass(result.grade_letter)">
                          {{ result.grade_letter }}
                        </span>
                      } @else {
                        <span class="text-slate-400 text-sm">—</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      @if (editingSubjectResult() === result.id) {
                        <div class="flex items-center gap-2">
                          <input
                            type="text"
                            [(ngModel)]="subjectCommentValue"
                            class="flex-1 px-2 py-1 text-xs rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            [attr.aria-label]="'Edit comment for ' + result.subject_name" />
                          <button (click)="saveSubjectComment(result)" class="p-1 text-green-600 hover:text-green-700" aria-label="Save comment">
                            <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon>
                          </button>
                          <button (click)="editingSubjectResult.set(null)" class="p-1 text-slate-400 hover:text-slate-600" aria-label="Cancel edit">
                            <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      } @else {
                        <div class="flex items-center gap-2 group">
                          <span>{{ result.teacher_comment || '—' }}</span>
                          <button (click)="startEditSubjectComment(result)" class="no-print opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-primary-600 transition-opacity" [attr.aria-label]="'Edit comment for ' + result.subject_name">
                            <lucide-icon [img]="Edit2Icon" [size]="12"></lucide-icon>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="grid grid-cols-3 gap-0 border-t border-b border-slate-200 dark:border-slate-800">
            <div class="p-4 text-center border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-500 dark:text-slate-400">Total Marks</p>
              <p class="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {{ detail()!.report_card.total_marks !== null ? detail()!.report_card.total_marks!.toFixed(1) : '—' }}
              </p>
            </div>
            <div class="p-4 text-center border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-500 dark:text-slate-400">Average</p>
              <p class="text-lg font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                {{ detail()!.report_card.average !== null ? detail()!.report_card.average!.toFixed(1) + '%' : '—' }}
              </p>
            </div>
            <div class="p-4 text-center">
              <p class="text-xs text-slate-500 dark:text-slate-400">Position</p>
              <p class="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                @if (detail()!.report_card.position !== null) {
                  {{ detail()!.report_card.position }} / {{ detail()!.class_size }}
                } @else {
                  —
                }
              </p>
            </div>
          </div>

          <!-- Class Teacher Comment -->
          <div class="p-5 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Class Teacher Comment</h3>
              <button
                (click)="startEditTeacherComment()"
                class="no-print p-1.5 text-slate-400 hover:text-primary-600 rounded-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                aria-label="Edit class teacher comment">
                <lucide-icon [img]="Edit2Icon" [size]="14"></lucide-icon>
              </button>
            </div>

            @if (editingTeacherComment()) {
              <div class="space-y-3">
                <textarea
                  [(ngModel)]="teacherCommentValue"
                  rows="3"
                  placeholder="Enter class teacher comment..."
                  aria-label="Class teacher comment"
                  class="w-full px-3 py-2 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"></textarea>
                <div class="mb-1">
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Promotion Status</label>
                  <select
                    [(ngModel)]="promotionStatusValue"
                    aria-label="Promotion status"
                    class="w-full px-3 py-2 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500">
                    <option value="">— Not set —</option>
                    <option value="promoted">Promoted</option>
                    <option value="retained">Retained</option>
                    <option value="requires_support">Requires Support</option>
                  </select>
                </div>
                <div class="flex gap-3">
                  <zb-button variant="primary" size="sm" (clicked)="saveTeacherComment()" [loading]="savingComment()">Save Comment</zb-button>
                  <zb-button variant="outline" size="sm" (clicked)="editingTeacherComment.set(false)">Cancel</zb-button>
                </div>
              </div>
            } @else {
              <p class="text-sm text-slate-600 dark:text-slate-400 italic">
                {{ detail()!.class_teacher_comment || 'No comment yet.' }}
              </p>
              @if (detail()!.report_card.promotion_status) {
                <span class="mt-2 inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ promotionLabel(detail()!.report_card.promotion_status) }}
                </span>
              }
            }
          </div>

          <!-- Attendance Placeholder -->
          <div class="p-5">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Attendance Summary</h3>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-3">
                <p class="text-xs text-slate-500">Total Days</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{{ detail()!.attendance.total_days ?? '—' }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-3">
                <p class="text-xs text-slate-500">Present</p>
                <p class="text-sm font-semibold text-green-600 dark:text-green-400 mt-0.5">{{ detail()!.attendance.present ?? '—' }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-3">
                <p class="text-xs text-slate-500">Absent</p>
                <p class="text-sm font-semibold text-red-600 dark:text-red-400 mt-0.5">{{ detail()!.attendance.absent ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ReportCardDetailPage implements OnInit {
    private readonly reportCardService = inject(ReportCardService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);

    readonly ArrowLeftIcon = ArrowLeft;
    readonly PrinterIcon = Printer;
    readonly CheckCircleIcon = CheckCircle;
    readonly GlobeIcon = Globe;
    readonly EyeOffIcon = EyeOff;
    readonly Edit2Icon = Edit2;
    readonly XIcon = X;
    readonly CheckIcon = Check;

    readonly loading = signal(false);
    readonly actionLoading = signal(false);
    readonly savingComment = signal(false);
    readonly detail = signal<ReportCardDetail | null>(null);
    readonly editingTeacherComment = signal(false);
    readonly editingSubjectResult = signal<number | null>(null);

    teacherCommentValue = '';
    promotionStatusValue = '';
    subjectCommentValue = '';

    readonly statusBadgeClass = computed(() => {
        const s = this.detail()?.report_card.status;
        const base = 'inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium';
        if (s === 'published') return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
        if (s === 'approved') return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
        return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`;
    });

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loadDetail(id);
    }

    loadDetail(id: number): void {
        this.loading.set(true);
        this.reportCardService.getReportCard(id).subscribe({
            next: res => {
                this.detail.set(res.data);
                this.teacherCommentValue = res.data.class_teacher_comment ?? '';
                this.promotionStatusValue = res.data.report_card.promotion_status ?? '';
                this.loading.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load report card.');
                this.loading.set(false);
            },
        });
    }

    print(): void {
        window.print();
    }

    approve(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.approve(id).subscribe({
            next: res => {
                this.detail.update(d => d ? { ...d, report_card: res.data } : d);
                this.actionLoading.set(false);
                this.toast.success('Report card approved.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to approve.');
                this.actionLoading.set(false);
            },
        });
    }

    publish(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.publish(id).subscribe({
            next: res => {
                this.detail.update(d => d ? { ...d, report_card: res.data } : d);
                this.actionLoading.set(false);
                this.toast.success('Report card published.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to publish.');
                this.actionLoading.set(false);
            },
        });
    }

    unpublish(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.unpublish(id).subscribe({
            next: res => {
                this.detail.update(d => d ? { ...d, report_card: res.data } : d);
                this.actionLoading.set(false);
                this.toast.success('Report card unpublished.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to unpublish.');
                this.actionLoading.set(false);
            },
        });
    }

    startEditTeacherComment(): void {
        this.teacherCommentValue = this.detail()?.class_teacher_comment ?? '';
        this.promotionStatusValue = this.detail()?.report_card.promotion_status ?? '';
        this.editingTeacherComment.set(true);
    }

    saveTeacherComment(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.savingComment.set(true);
        this.reportCardService.updateClassTeacherComment(id, this.teacherCommentValue, this.promotionStatusValue || null).subscribe({
            next: res => {
                this.detail.update(d => d ? { ...d, report_card: res.data, class_teacher_comment: res.data.class_teacher_comment } : d);
                this.editingTeacherComment.set(false);
                this.savingComment.set(false);
                this.toast.success('Comment saved.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save comment.');
                this.savingComment.set(false);
            },
        });
    }

    startEditSubjectComment(result: SubjectResult & { subject_name: string; subject_code: string }): void {
        this.subjectCommentValue = result.teacher_comment ?? '';
        this.editingSubjectResult.set(result.id);
    }

    saveSubjectComment(result: SubjectResult & { subject_name: string; subject_code: string }): void {
        this.reportCardService.updateSubjectComment(result.id, this.subjectCommentValue).subscribe({
            next: res => {
                this.detail.update(d => {
                    if (!d) return d;
                    const updated = d.subject_results.map(sr =>
                        sr.id === result.id ? { ...sr, teacher_comment: res.data.teacher_comment } : sr
                    );
                    return { ...d, subject_results: updated };
                });
                this.editingSubjectResult.set(null);
                this.toast.success('Comment saved.');
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save comment.');
            },
        });
    }

    gradeClass(grade: string): string {
        const map: Record<string, string> = {
            'A': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'E': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
            'F': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return map[grade] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }

    promotionLabel(status: string | null): string {
        if (!status) return '';
        const labels: Record<string, string> = {
            promoted: 'Promoted',
            retained: 'Retained',
            requires_support: 'Requires Support',
        };
        return labels[status] ?? status;
    }
}
