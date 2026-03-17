import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, RefreshCw, Printer, Download, CheckCircle, Globe, EyeOff, Edit2, X, Check } from 'lucide-angular';
import { TitleCasePipe } from '@angular/common';
import { ReportCardService } from '../../services/report-card.service';
import { AcademicYearService } from '../../services/academic-year.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReportCardSummary, ReportCardDetail, AcademicTerm, SchoolClass, AcademicYear, SubjectResult } from '../../../../core/models/school-admin.models';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ToastService } from '../../../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-class-report-cards',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, ZbSelect, ZbButton, FormsModule, TitleCasePipe],
    styles: [`
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .max-w-4xl { max-width: 100% !important; box-shadow: none !important; border: none !important; }
            @page { margin: 15mm; size: A4; }
        }
    `],
    template: `
    <div class="p-6 lg:p-8 space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Report Cards</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Select a class, term and student to view a report card</p>
      </div>

      <!-- Selectors card -->
      <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 no-print">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Class -->
          <zb-select
            label="Class"
            [options]="classOptions()"
            placeholderOption="Select class..."
            [ngModel]="selectedClassId()"
            (ngModelChange)="onClassChange($event)"
            name="classSelect" />

          <!-- Term — shown once class is selected -->
          @if (selectedClassId()) {
            <zb-select
              label="Term"
              [options]="termOptions()"
              placeholderOption="Select term..."
              [ngModel]="selectedTermId()"
              (ngModelChange)="onTermChange($event)"
              name="termSelect" />
          }

          <!-- Student — shown once class + term selected and report cards loaded -->
          @if (selectedClassId() && selectedTermId()) {
            <zb-select
              label="Student"
              [options]="studentOptions()"
              placeholderOption="Select student..."
              [ngModel]="selectedStudentId()"
              (ngModelChange)="onStudentChange($event)"
              name="studentSelect" />
          }
        </div>

        <!-- Actions row -->
        @if (selectedClassId() && selectedTermId()) {
          <div class="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <zb-button
              [iconLeft]="RefreshIcon"
              variant="outline"
              size="sm"
              (clicked)="calculateResults()"
              [loading]="calculating()"
              [disabled]="!selectedClassId() || !selectedTermId()">
              Calculate Results
            </zb-button>

            @if (loadingList()) {
              <span class="text-xs text-slate-400 flex items-center gap-1.5">
                <div class="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </span>
            } @else if (reportCards().length > 0) {
              <span class="text-xs text-slate-400">{{ reportCards().length }} student{{ reportCards().length !== 1 ? 's' : '' }}</span>
            }
          </div>
        }
      </div>

      <!-- Empty state — class + term selected but no report cards yet -->
      @if (selectedClassId() && selectedTermId() && !loadingList() && reportCards().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 py-16 text-center text-slate-400 no-print">
          <lucide-icon [img]="FileTextIcon" [size]="40" class="mx-auto mb-4 opacity-40"></lucide-icon>
          <p class="text-sm font-medium">No report cards yet</p>
          <p class="text-xs mt-1">Click <strong>Calculate Results</strong> above to generate them.</p>
        </div>
      }

      <!-- Loading report card detail -->
      @if (loadingDetail()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading report card">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Inline Report Card -->
      @if (!loadingDetail() && detail()) {
        <!-- Print actions -->
        <div class="flex items-center gap-2 flex-wrap no-print">
          <zb-button variant="outline" size="sm" [iconLeft]="PrinterIcon" (clicked)="print()">Print</zb-button>
          <zb-button variant="outline" size="sm" [iconLeft]="DownloadIcon" (clicked)="downloadPdf()" [loading]="downloadingPdf()">Download PDF</zb-button>

          @if (canApprove() && detail()!.report_card.status === 'draft') {
            <zb-button variant="primary" size="sm" [iconLeft]="CheckCircleIcon" (clicked)="approve()" [loading]="actionLoading()">Approve</zb-button>
          }
          @if (canPublish() && detail()!.report_card.status === 'approved') {
            <zb-button variant="primary" size="sm" [iconLeft]="GlobeIcon" (clicked)="publish()" [loading]="actionLoading()">Publish</zb-button>
          }
          @if (canPublish() && detail()!.report_card.status === 'published') {
            <zb-button variant="outline" size="sm" [iconLeft]="EyeOffIcon" (clicked)="unpublish()" [loading]="actionLoading()">Unpublish</zb-button>
          }
        </div>

        <!-- Report Card Document -->
        <div #reportCardEl class="max-w-4xl mx-auto bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">

          <!-- Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-800 text-center">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Academic Report Card</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ detail()!.academic_year.name }} — {{ detail()!.term.name }}
            </p>
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
                          <button (click)="editingSubjectResult.set(null)" class="p-1 text-slate-400 hover:text-slate-600" aria-label="Cancel">
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
                } @else { — }
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
                <div>
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

          <!-- Attendance -->
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
export class ClassReportCards implements OnInit {
    private readonly reportCardService = inject(ReportCardService);
    private readonly academicYearService = inject(AcademicYearService);
    private readonly authService = inject(AuthService);
    private readonly http = inject(HttpClient);
    private readonly toast = inject(ToastService);

    readonly FileTextIcon = FileText;
    readonly RefreshIcon = RefreshCw;
    readonly PrinterIcon = Printer;
    readonly DownloadIcon = Download;
    readonly CheckCircleIcon = CheckCircle;

    readonly reportCardEl = viewChild<ElementRef<HTMLElement>>('reportCardEl');
    readonly downloadingPdf = signal(false);
    readonly GlobeIcon = Globe;
    readonly EyeOffIcon = EyeOff;
    readonly Edit2Icon = Edit2;
    readonly XIcon = X;
    readonly CheckIcon = Check;

    // Reference data
    readonly classes = signal<SchoolClass[]>([]);
    readonly terms = signal<AcademicTerm[]>([]);
    readonly reportCards = signal<ReportCardSummary[]>([]);

    // Selection
    readonly selectedClassId = signal('');
    readonly selectedTermId = signal('');
    readonly selectedStudentId = signal('');

    // Loading states
    readonly loadingList = signal(false);
    readonly loadingDetail = signal(false);
    readonly calculating = signal(false);
    readonly actionLoading = signal(false);
    readonly savingComment = signal(false);

    // Report card detail
    readonly detail = signal<ReportCardDetail | null>(null);
    readonly editingTeacherComment = signal(false);
    readonly editingSubjectResult = signal<number | null>(null);

    teacherCommentValue = '';
    promotionStatusValue = '';
    subjectCommentValue = '';

    readonly classOptions = computed<SelectOption[]>(() =>
        this.classes().map(c => ({ value: String(c.id), label: c.name }))
    );

    readonly termOptions = computed<SelectOption[]>(() =>
        this.terms().map(t => ({ value: String(t.id), label: t.name }))
    );

    readonly studentOptions = computed<SelectOption[]>(() =>
        this.reportCards().map(rc => ({
            value: String(rc.id),
            label: (rc.student as { name: string } | undefined)?.name ?? `Student ${rc.id}`,
        }))
    );

    /** class_teacher, hod, school_admin can approve */
    readonly canApprove = computed(() =>
        ['school_admin', 'class_teacher', 'hod'].includes(this.authService.userRole() ?? '')
    );

    /** Only school_admin can publish/unpublish */
    readonly canPublish = computed(() =>
        this.authService.userRole() === 'school_admin'
    );

    readonly statusBadgeClass = computed(() => {
        const s = this.detail()?.report_card.status;
        const base = 'inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium';
        if (s === 'published') return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
        if (s === 'approved') return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
        return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`;
    });

    ngOnInit(): void {
        this.loadReferenceData();
    }

    loadReferenceData(): void {
        this.http.get<any>(`${environment.apiUrl}/classes?per_page=100`).subscribe({
            next: res => this.classes.set(res.data.data),
            error: () => {},
        });

        this.academicYearService.getAcademicYears({ per_page: 100, include: 'terms' }).subscribe({
            next: (res: any) => {
                const years: AcademicYear[] = res.data.data;
                this.terms.set(years.flatMap(y => y.terms ?? []));
            },
            error: () => {},
        });
    }

    onClassChange(val: string): void {
        this.selectedClassId.set(val);
        this.selectedTermId.set('');
        this.selectedStudentId.set('');
        this.reportCards.set([]);
        this.detail.set(null);
    }

    onTermChange(val: string): void {
        this.selectedTermId.set(val);
        this.selectedStudentId.set('');
        this.detail.set(null);
        if (val && this.selectedClassId()) {
            this.loadReportCards();
        } else {
            this.reportCards.set([]);
        }
    }

    onStudentChange(reportCardId: string): void {
        this.selectedStudentId.set(reportCardId);
        this.detail.set(null);
        this.editingTeacherComment.set(false);
        this.editingSubjectResult.set(null);
        if (reportCardId) {
            this.loadDetail(Number(reportCardId));
        }
    }

    loadReportCards(): void {
        const classId = Number(this.selectedClassId());
        const termId = Number(this.selectedTermId());
        if (!classId || !termId) return;

        this.loadingList.set(true);
        this.reportCardService.getClassReportCards(classId, termId).subscribe({
            next: res => {
                this.reportCards.set(res.data);
                this.loadingList.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load report cards.');
                this.loadingList.set(false);
            },
        });
    }

    loadDetail(id: number): void {
        this.loadingDetail.set(true);
        this.reportCardService.getReportCard(id).subscribe({
            next: res => {
                this.detail.set(res.data);
                this.teacherCommentValue = res.data.class_teacher_comment ?? '';
                this.promotionStatusValue = res.data.report_card.promotion_status ?? '';
                this.loadingDetail.set(false);
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load report card.');
                this.loadingDetail.set(false);
            },
        });
    }

    calculateResults(): void {
        const classId = Number(this.selectedClassId());
        const termId = Number(this.selectedTermId());
        if (!classId || !termId) return;

        this.calculating.set(true);
        this.reportCardService.calculateResults(classId, termId).subscribe({
            next: () => {
                this.calculating.set(false);
                this.toast.success('Results calculated successfully.');
                this.loadReportCards();
            },
            error: err => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to calculate results.');
                this.calculating.set(false);
            },
        });
    }

    print(): void { window.print(); }

    async downloadPdf(): Promise<void> {
        const el = this.reportCardEl()?.nativeElement;
        if (!el) return;

        this.downloadingPdf.set(true);
        try {
            const [{ toPng }, { jsPDF }] = await Promise.all([
                import('html-to-image'),
                import('jspdf'),
            ]);

            const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });

            const img = new Image();
            img.src = dataUrl;
            await new Promise(resolve => { img.onload = resolve; });

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;

            let y = 0;
            while (y < imgHeight) {
                if (y > 0) pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, -y, imgWidth, imgHeight);
                y += pageHeight;
            }

            const studentName = this.detail()?.student.name ?? 'report-card';
            const termName = this.detail()?.term.name ?? '';
            pdf.save(`${studentName} - ${termName}.pdf`);
        } catch {
            this.toast.error('Error', 'Failed to generate PDF.');
        } finally {
            this.downloadingPdf.set(false);
        }
    }

    approve(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.approve(id).subscribe({
            next: res => { this.detail.update(d => d ? { ...d, report_card: res.data } : d); this.actionLoading.set(false); this.toast.success('Approved.'); },
            error: err => { this.toast.error('Error', err?.error?.message ?? 'Failed.'); this.actionLoading.set(false); },
        });
    }

    publish(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.publish(id).subscribe({
            next: res => { this.detail.update(d => d ? { ...d, report_card: res.data } : d); this.actionLoading.set(false); this.toast.success('Published.'); },
            error: err => { this.toast.error('Error', err?.error?.message ?? 'Failed.'); this.actionLoading.set(false); },
        });
    }

    unpublish(): void {
        const id = this.detail()?.report_card.id;
        if (!id) return;
        this.actionLoading.set(true);
        this.reportCardService.unpublish(id).subscribe({
            next: res => { this.detail.update(d => d ? { ...d, report_card: res.data } : d); this.actionLoading.set(false); this.toast.success('Unpublished.'); },
            error: err => { this.toast.error('Error', err?.error?.message ?? 'Failed.'); this.actionLoading.set(false); },
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
            error: err => { this.toast.error('Error', err?.error?.message ?? 'Failed.'); this.savingComment.set(false); },
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
                    return { ...d, subject_results: d.subject_results.map(sr => sr.id === result.id ? { ...sr, teacher_comment: res.data.teacher_comment } : sr) };
                });
                this.editingSubjectResult.set(null);
                this.toast.success('Comment saved.');
            },
            error: err => { this.toast.error('Error', err?.error?.message ?? 'Failed.'); },
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
        const labels: Record<string, string> = { promoted: 'Promoted', retained: 'Retained', requires_support: 'Requires Support' };
        return labels[status] ?? status;
    }
}
