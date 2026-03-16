import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Users, Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-angular';
import { TeacherService, CreateTeacherPayload } from '../../services/teacher.service';
import { Teacher } from '../../models/user-management.models';
import { ZbDatatable, DataTableColumn, DataTableAction } from '../../../../shared/components/ui/zb-datatable';
import { ZbModal } from '../../../../shared/components/ui/zb-modal';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbDatepicker } from '../../../../shared/components/ui/zb-datepicker';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';

type ModalTab = 'form' | 'import';

interface CsvRow {
    name: string;
    email: string;
    phone: string;
    employee_number: string;
    qualification: string;
    specialization: string;
    join_date: string;
}

const SAMPLE_CSV = `name,email,phone,employee_number,qualification,specialization,join_date
John Smith,john.smith@school.edu,+263771234567,EMP-001,B.Ed Mathematics,Mathematics,2023-01-15
Jane Doe,jane.doe@school.edu,+263772345678,EMP-002,PGCE Science,Biology,2022-08-01`;

@Component({
    selector: 'app-teacher-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbDatatable, ZbModal, ZbInput, ZbButton, ZbDatepicker],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Teachers</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage teaching staff and their profiles</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="openAddModal()" aria-label="Add teacher">
          Add Teacher
        </zb-button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16" role="status" aria-label="Loading teachers">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <zb-datatable
            [data]="teachers()"
            [columns]="columns"
            [actions]="tableActions"
            trackBy="id" />
        </div>
      }
    </div>

    <!-- Add / Edit / Import Modal -->
    @if (showModal()) {
      <zb-modal
        [title]="editingId() ? 'Edit Teacher' : 'Teacher Management'"
        [icon]="UsersIcon"
        size="xl"
        (close)="closeModal()">

        <!-- Tabs (only when adding, not editing) -->
        @if (!editingId()) {
          <div class="flex border-b border-slate-200 dark:border-slate-800" role="tablist">
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'form'"
              (click)="activeTab.set('form')"
              class="flex-1 px-5 py-3 text-sm font-medium transition-colors"
              [class]="activeTab() === 'form'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
              <span class="flex items-center justify-center gap-2">
                <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                Add Teacher
              </span>
            </button>
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'import'"
              (click)="activeTab.set('import')"
              class="flex-1 px-5 py-3 text-sm font-medium transition-colors"
              [class]="activeTab() === 'import'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
              <span class="flex items-center justify-center gap-2">
                <lucide-icon [img]="UploadIcon" [size]="14"></lucide-icon>
                Import CSV
              </span>
            </button>
          </div>
        }

        <!-- Teacher Form Tab -->
        @if (activeTab() === 'form' || editingId()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">
            @if (formError()) {
              <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
                {{ formError() }}
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <zb-input
                formControlName="name"
                label="Full Name"
                placeholder="e.g. John Smith"
                [required]="true"
                [error]="getFieldError('name', 'Full name is required')" />

              <zb-input
                formControlName="email"
                type="email"
                label="Email Address"
                placeholder="teacher@school.edu"
                [required]="true"
                [error]="getEmailError()" />

              @if (!editingId()) {
                <zb-input
                  formControlName="password"
                  type="password"
                  label="Password"
                  placeholder="Min. 8 characters"
                  [required]="true"
                  [error]="getFieldError('password', 'Minimum 8 characters required')" />
              }

              <zb-input
                formControlName="phone"
                type="tel"
                label="Phone"
                placeholder="+263 77 123 4567" />

              <zb-input
                formControlName="employee_number"
                label="Employee Number"
                placeholder="e.g. EMP-001" />

              <zb-input
                formControlName="qualification"
                label="Qualification"
                placeholder="e.g. B.Ed, PGCE" />

              <zb-input
                formControlName="specialization"
                label="Specialization"
                placeholder="e.g. Mathematics" />

              <zb-datepicker
                formControlName="join_date"
                label="Join Date"
                placeholder="Select join date" />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <zb-button variant="outline" type="button" (clicked)="closeModal()">Cancel</zb-button>
              <zb-button
                variant="primary"
                type="submit"
                [loading]="submitting()"
                [disabled]="form.invalid">
                {{ editingId() ? 'Update Teacher' : 'Create Teacher' }}
              </zb-button>
            </div>
          </form>
        }

        <!-- Import CSV Tab -->
        @if (activeTab() === 'import' && !editingId()) {
          <div class="px-6 py-5 space-y-5">
            <!-- Instructions -->
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-sm p-4">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Required CSV columns (in order):</p>
              <code class="block text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 p-2 rounded font-mono">
                name, email, phone, employee_number, qualification, specialization, join_date
              </code>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-2"><strong>Required:</strong> name, email &nbsp;•&nbsp; <strong>Optional:</strong> all other fields</p>
              <button
                type="button"
                (click)="downloadSample()"
                class="mt-2 flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-medium transition-colors"
                aria-label="Download sample CSV">
                <lucide-icon [img]="DownloadIcon" [size]="13"></lucide-icon>
                Download sample CSV
              </button>
            </div>

            <!-- File Upload -->
            <div>
              <label
                for="csv-upload"
                class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-sm cursor-pointer transition-colors"
                [class]="csvFile() ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'">
                @if (csvFile()) {
                  <lucide-icon [img]="FileTextIcon" [size]="24" class="text-primary-600 dark:text-primary-400 mb-1.5"></lucide-icon>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ csvFile()!.name }}</p>
                  <p class="text-xs text-slate-500">{{ formatFileSize(csvFile()!.size) }}</p>
                } @else {
                  <lucide-icon [img]="UploadIcon" [size]="24" class="text-slate-400 mb-1.5"></lucide-icon>
                  <p class="text-sm text-slate-600 dark:text-slate-400">Click to select a <strong>.csv</strong> file</p>
                }
                <input id="csv-upload" type="file" accept=".csv,text/csv" class="hidden" (change)="onFileSelected($event)" aria-label="Upload CSV file">
              </label>
            </div>

            <!-- Preview -->
            @if (csvPreview().length > 0) {
              <div>
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Preview — first {{ csvPreview().length }} of {{ csvTotal() }} rows
                </p>
                <div class="overflow-x-auto rounded-sm border border-slate-200 dark:border-slate-700">
                  <table class="w-full text-xs" aria-label="CSV preview">
                    <thead class="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        @for (h of csvHeaders; track h) {
                          <th class="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{{ h }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      @for (row of csvPreview(); track $index) {
                        <tr>
                          <td class="px-3 py-2 text-slate-900 dark:text-white font-medium">{{ row.name }}</td>
                          <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ row.email }}</td>
                          <td class="px-3 py-2 text-slate-500">{{ row.phone || '—' }}</td>
                          <td class="px-3 py-2 text-slate-500 font-mono">{{ row.employee_number || '—' }}</td>
                          <td class="px-3 py-2 text-slate-500">{{ row.qualification || '—' }}</td>
                          <td class="px-3 py-2 text-slate-500">{{ row.specialization || '—' }}</td>
                          <td class="px-3 py-2 text-slate-500">{{ row.join_date || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Import result -->
            @if (importResult()) {
              <div class="p-3 rounded-sm border"
                [class]="importResult()!.errors.length === 0
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'"
                role="status">
                <div class="flex items-center gap-2 mb-1">
                  @if (importResult()!.errors.length === 0) {
                    <lucide-icon [img]="CheckCircleIcon" [size]="15" class="text-green-600 dark:text-green-400"></lucide-icon>
                    <p class="text-sm font-semibold text-green-800 dark:text-green-300">Import Complete</p>
                  } @else {
                    <lucide-icon [img]="AlertTriangleIcon" [size]="15" class="text-yellow-600 dark:text-yellow-400"></lucide-icon>
                    <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Import Complete with Warnings</p>
                  }
                </div>
                <p class="text-sm text-slate-700 dark:text-slate-300">Imported <strong>{{ importResult()!.imported }}</strong> teacher(s).</p>
                @if (importResult()!.errors.length > 0) {
                  <ul class="mt-1.5 space-y-0.5">
                    @for (err of importResult()!.errors; track $index) {
                      <li class="text-xs text-yellow-700 dark:text-yellow-400">{{ err }}</li>
                    }
                  </ul>
                }
              </div>
            }

            @if (importError()) {
              <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
                {{ importError() }}
              </div>
            }

            <div class="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              @if (csvFile()) {
                <zb-button variant="outline" type="button" (clicked)="clearCsvFile()">Clear</zb-button>
              }
              <zb-button
                variant="primary"
                [iconLeft]="UploadIcon"
                [loading]="importing()"
                [disabled]="!csvFile()"
                (clicked)="onImport()">
                Import Teachers
              </zb-button>
            </div>
          </div>
        }
      </zb-modal>
    }
  `,
})
export class TeacherList implements OnInit {
    private readonly teacherService = inject(TeacherService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    readonly PlusIcon = Plus;
    readonly UsersIcon = Users;
    readonly UploadIcon = Upload;
    readonly FileTextIcon = FileText;
    readonly CheckCircleIcon = CheckCircle;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly DownloadIcon = Download;

    readonly csvHeaders = ['name', 'email', 'phone', 'employee_number', 'qualification', 'specialization', 'join_date'];

    // List state
    readonly teachers = signal<Teacher[]>([]);
    readonly loading = signal(false);

    // Modal state
    readonly showModal = signal(false);
    readonly activeTab = signal<ModalTab>('form');
    readonly editingId = signal<number | null>(null);
    readonly submitting = signal(false);
    readonly formError = signal<string | null>(null);

    // Import state
    readonly csvFile = signal<File | null>(null);
    readonly csvPreview = signal<CsvRow[]>([]);
    readonly csvTotal = signal(0);
    readonly importing = signal(false);
    readonly importResult = signal<{ imported: number; errors: string[] } | null>(null);
    readonly importError = signal<string | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.minLength(8)]],
        phone: [''],
        employee_number: [''],
        qualification: [''],
        specialization: [''],
        join_date: [''],
    });

    readonly columns: DataTableColumn<Teacher>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterable: true,
            htmlFormatter: (t: Teacher) =>
                `<div class="font-medium text-slate-900 dark:text-white">${t.name}</div>` +
                `<div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${t.email}</div>`,
        },
        { key: 'phone', label: 'Phone', formatter: v => (v as string) || '—' },
        { key: 'teacherProfile', label: 'Employee #', formatter: v => (v as { employee_number?: string } | undefined)?.employee_number ?? '—' },
        { key: 'is_active', label: 'Status', formatter: v => v ? 'Active' : 'Inactive' },
    ];

    readonly tableActions: DataTableAction<Teacher>[] = [
        { label: 'View', variant: 'outline', size: 'sm', callback: t => this.router.navigate(['/tenant/teachers', t.id]) },
        { label: 'Edit', variant: 'outline', size: 'sm', callback: t => this.editTeacher(t) },
        { label: 'Delete', variant: 'danger', size: 'sm', callback: t => this.deleteTeacher(t) },
    ];

    ngOnInit(): void {
        this.loadTeachers();
    }

    loadTeachers(): void {
        this.loading.set(true);
        this.teacherService.getTeachers({ per_page: 100 }).subscribe({
            next: (res) => {
                this.teachers.set(res.data.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load teachers.');
                this.loading.set(false);
            },
        });
    }

    openAddModal(): void {
        this.editingId.set(null);
        this.form.reset();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
        this.formError.set(null);
        this.activeTab.set('form');
        this.clearCsvFile();
        this.showModal.set(true);
    }

    editTeacher(teacher: Teacher): void {
        this.editingId.set(teacher.id);
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.form.patchValue({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone ?? '',
            employee_number: teacher.teacherProfile?.employee_number ?? '',
            qualification: teacher.teacherProfile?.qualification ?? '',
            specialization: teacher.teacherProfile?.specialization ?? '',
            join_date: teacher.teacherProfile?.join_date ?? '',
        });
        this.formError.set(null);
        this.activeTab.set('form');
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingId.set(null);
        this.form.reset();
        this.clearCsvFile();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.formError.set(null);

        const values = this.form.getRawValue();
        const id = this.editingId();

        const payload: CreateTeacherPayload = {
            name: values.name!,
            email: values.email!,
            phone: values.phone || undefined,
            employee_number: values.employee_number || undefined,
            qualification: values.qualification || undefined,
            specialization: values.specialization || undefined,
            join_date: values.join_date || undefined,
        };
        if (values.password) payload.password = values.password;

        const request = id
            ? this.teacherService.updateTeacher(id, payload)
            : this.teacherService.createTeacher(payload);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.closeModal();
                this.toast.success(id ? 'Teacher updated.' : 'Teacher created.');
                this.loadTeachers();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Failed to save teacher.');
                this.submitting.set(false);
            },
        });
    }

    async deleteTeacher(teacher: Teacher): Promise<void> {
        const confirmed = await this.alertService.confirm({ title: 'Confirm', message: `Delete "${teacher.name}"? This cannot be undone.`, confirmText: 'Delete', type: 'danger' });
        if (!confirmed) return;

        this.teacherService.deleteTeacher(teacher.id).subscribe({
            next: () => {
                this.toast.success('Teacher deleted.');
                this.loadTeachers();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete teacher.');
            },
        });
    }

    // CSV Import
    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.csvFile.set(file);
        this.importResult.set(null);
        this.importError.set(null);
        this.parsePreview(file);
    }

    private parsePreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            const dataLines = lines.slice(1);
            this.csvTotal.set(dataLines.length);
            this.csvPreview.set(dataLines.slice(0, 5).map(line => {
                const cols = line.split(',').map(c => c.trim());
                return {
                    name: cols[0] ?? '',
                    email: cols[1] ?? '',
                    phone: cols[2] ?? '',
                    employee_number: cols[3] ?? '',
                    qualification: cols[4] ?? '',
                    specialization: cols[5] ?? '',
                    join_date: cols[6] ?? '',
                };
            }));
        };
        reader.readAsText(file);
    }

    onImport(): void {
        const file = this.csvFile();
        if (!file) return;

        this.importing.set(true);
        this.importError.set(null);
        this.importResult.set(null);

        this.teacherService.importFromCsv(file).subscribe({
            next: (res) => {
                this.importResult.set(res.data);
                this.importing.set(false);
                this.loadTeachers();
            },
            error: (err) => {
                this.importError.set(err?.error?.message ?? 'Import failed. Check your file and try again.');
                this.importing.set(false);
            },
        });
    }

    clearCsvFile(): void {
        this.csvFile.set(null);
        this.csvPreview.set([]);
        this.csvTotal.set(0);
        this.importResult.set(null);
        this.importError.set(null);
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    downloadSample(): void {
        const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teachers-import-sample.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    getFieldError(field: string, msg: string): string {
        const ctrl = this.form.get(field);
        return ctrl?.invalid && ctrl?.touched ? msg : '';
    }

    getEmailError(): string {
        const ctrl = this.form.get('email');
        if (!ctrl?.touched) return '';
        if (ctrl.hasError('required')) return 'Email is required';
        if (ctrl.hasError('email')) return 'Enter a valid email address';
        return '';
    }
}
