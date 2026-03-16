import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-angular';
import { TeacherService } from '../../services/teacher.service';

interface CsvRow {
    name: string;
    email: string;
    phone: string;
    employee_number: string;
    qualification: string;
    specialization: string;
    join_date: string;
}

const CSV_HEADERS = ['name', 'email', 'phone', 'employee_number', 'qualification', 'specialization', 'join_date'];
const SAMPLE_CSV = `name,email,phone,employee_number,qualification,specialization,join_date
John Smith,john.smith@school.edu,+263771234567,EMP-001,B.Ed Mathematics,Mathematics,2023-01-15
Jane Doe,jane.doe@school.edu,+263772345678,EMP-002,PGCE Science,Biology,2022-08-01`;

@Component({
    selector: 'app-teacher-import',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/tenant/teachers"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to teachers list">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to Teachers
        </a>
      </div>

      <div class="max-w-3xl">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Bulk Import Teachers</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a CSV file to create multiple teacher accounts at once.</p>
        </div>

        <!-- Instructions card -->
        <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-sm p-4 mb-6">
          <h2 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">CSV Format Requirements</h2>
          <p class="text-xs text-blue-700 dark:text-blue-400 mb-2">The first row must be a header row with the following columns (in order):</p>
          <code class="block text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 p-2 rounded font-mono">
            name, email, phone, employee_number, qualification, specialization, join_date
          </code>
          <p class="text-xs text-blue-700 dark:text-blue-400 mt-2"><strong>Required:</strong> name, email &nbsp;&bull;&nbsp; <strong>Optional:</strong> all other fields</p>
          <button
            (click)="downloadSample()"
            class="mt-3 flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-medium transition-colors"
            aria-label="Download sample CSV file">
            <lucide-icon [img]="DownloadIcon" [size]="14"></lucide-icon>
            Download sample CSV
          </button>
        </div>

        <!-- Upload area -->
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Select File</h2>

          <label
            for="csv-upload"
            class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-sm cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            [class.border-primary-400]="selectedFile()"
            [class.bg-primary-50]="selectedFile()">
            @if (selectedFile()) {
              <div class="flex flex-col items-center gap-2">
                <lucide-icon [img]="FileTextIcon" [size]="28" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ selectedFile()!.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatFileSize(selectedFile()!.size) }}</p>
              </div>
            } @else {
              <div class="flex flex-col items-center gap-2">
                <lucide-icon [img]="UploadIcon" [size]="28" class="text-slate-400"></lucide-icon>
                <p class="text-sm text-slate-600 dark:text-slate-400">Click to select a <strong>.csv</strong> file</p>
                <p class="text-xs text-slate-400">Max file size: 2MB</p>
              </div>
            }
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              class="hidden"
              (change)="onFileSelected($event)"
              aria-label="Upload CSV file">
          </label>
        </div>

        <!-- Preview table -->
        @if (previewRows().length > 0) {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Preview
              <span class="ml-2 text-xs font-normal text-slate-500">(showing first {{ previewRows().length }} of {{ totalRows() }} rows)</span>
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-xs" aria-label="CSV preview table">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    @for (h of csvHeaders; track h) {
                      <th scope="col" class="text-left px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (row of previewRows(); track $index) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td class="px-3 py-2 text-slate-900 dark:text-white font-medium">{{ row.name }}</td>
                      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ row.email }}</td>
                      <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ row.phone || '—' }}</td>
                      <td class="px-3 py-2 text-slate-500 dark:text-slate-400 font-mono">{{ row.employee_number || '—' }}</td>
                      <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ row.qualification || '—' }}</td>
                      <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ row.specialization || '—' }}</td>
                      <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ row.join_date || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Result -->
        @if (importResult()) {
          <div class="mb-6 p-4 rounded-sm border"
            [class.bg-green-50]="importResult()!.errors.length === 0"
            [class.dark:bg-green-950\/30]="importResult()!.errors.length === 0"
            [class.border-green-200]="importResult()!.errors.length === 0"
            [class.dark:border-green-800]="importResult()!.errors.length === 0"
            [class.bg-yellow-50]="importResult()!.errors.length > 0"
            [class.dark:bg-yellow-950\/30]="importResult()!.errors.length > 0"
            [class.border-yellow-200]="importResult()!.errors.length > 0"
            [class.dark:border-yellow-800]="importResult()!.errors.length > 0"
            role="status">
            <div class="flex items-center gap-2 mb-2">
              @if (importResult()!.errors.length === 0) {
                <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-green-600 dark:text-green-400"></lucide-icon>
                <p class="text-sm font-semibold text-green-800 dark:text-green-300">Import Complete</p>
              } @else {
                <lucide-icon [img]="AlertTriangleIcon" [size]="16" class="text-yellow-600 dark:text-yellow-400"></lucide-icon>
                <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Import Complete with Warnings</p>
              }
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-300">
              Successfully imported <strong>{{ importResult()!.imported }}</strong> teacher(s).
            </p>
            @if (importResult()!.errors.length > 0) {
              <ul class="mt-2 space-y-1">
                @for (err of importResult()!.errors; track $index) {
                  <li class="text-xs text-yellow-700 dark:text-yellow-400">{{ err }}</li>
                }
              </ul>
            }
          </div>
        }

        <!-- Upload error -->
        @if (uploadError()) {
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
            {{ uploadError() }}
          </div>
        }

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            (click)="onImport()"
            [disabled]="!selectedFile() || uploading()"
            class="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
            @if (uploading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Importing...
            } @else {
              <lucide-icon [img]="UploadIcon" [size]="16"></lucide-icon>
              Import Teachers
            }
          </button>
          @if (selectedFile()) {
            <button
              (click)="clearFile()"
              class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
              Clear
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class TeacherImport {
    private readonly teacherService = inject(TeacherService);

    readonly ArrowLeftIcon = ArrowLeft;
    readonly UploadIcon = Upload;
    readonly FileTextIcon = FileText;
    readonly CheckCircleIcon = CheckCircle;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly DownloadIcon = Download;

    readonly csvHeaders = CSV_HEADERS;

    readonly selectedFile = signal<File | null>(null);
    readonly previewRows = signal<CsvRow[]>([]);
    readonly totalRows = signal(0);
    readonly uploading = signal(false);
    readonly uploadError = signal<string | null>(null);
    readonly importResult = signal<{ imported: number; errors: string[] } | null>(null);

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        this.selectedFile.set(file);
        this.importResult.set(null);
        this.uploadError.set(null);
        this.parsePreview(file);
    }

    private parsePreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            const dataLines = lines.slice(1); // skip header
            this.totalRows.set(dataLines.length);
            const rows: CsvRow[] = dataLines.slice(0, 5).map(line => {
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
            });
            this.previewRows.set(rows);
        };
        reader.readAsText(file);
    }

    onImport(): void {
        const file = this.selectedFile();
        if (!file) return;

        this.uploading.set(true);
        this.uploadError.set(null);
        this.importResult.set(null);

        this.teacherService.importFromCsv(file).subscribe({
            next: (res) => {
                this.importResult.set(res.data);
                this.uploading.set(false);
            },
            error: (err) => {
                this.uploadError.set(err?.error?.message ?? 'Import failed. Please check your file and try again.');
                this.uploading.set(false);
            },
        });
    }

    clearFile(): void {
        this.selectedFile.set(null);
        this.previewRows.set([]);
        this.totalRows.set(0);
        this.importResult.set(null);
        this.uploadError.set(null);
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
}
