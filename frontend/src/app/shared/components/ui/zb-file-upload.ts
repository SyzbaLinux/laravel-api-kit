import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { LucideAngularModule, Upload, FileText, X, AlertCircle } from 'lucide-angular';

export interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

@Component({
  selector: 'zb-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="w-full">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {{ label() }}
        </label>
      }

      <!-- Drop zone -->
      <div
        class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
        [class]="dragOver()
          ? 'border-primary-500 bg-primary-500/5'
          : 'border-slate-300 dark:border-slate-700 hover:border-primary-500/50'"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)"
      >
        <lucide-icon [img]="UploadIcon" [size]="28" class="text-slate-400 mx-auto mb-2"></lucide-icon>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Click to upload or drag and drop
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500">{{ acceptHint() }}</p>
      </div>

      <input
        #fileInput
        type="file"
        [accept]="accept()"
        [multiple]="multiple()"
        (change)="onFileSelected($event)"
        class="hidden"
      />

      <!-- File list -->
      @if (files().length > 0) {
        <div class="mt-3 space-y-2">
          @for (file of files(); track file.name) {
            <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div class="flex items-center gap-2.5 min-w-0">
                <lucide-icon [img]="FileTextIcon" [size]="16" class="text-slate-500 shrink-0"></lucide-icon>
                <div class="min-w-0">
                  <p class="text-sm text-slate-700 dark:text-slate-300 truncate">{{ file.name }}</p>
                  <p class="text-xs text-slate-400">{{ file.size }}</p>
                </div>
              </div>
              <button
                type="button"
                (click)="removeFile(file.name)"
                class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
              >
                <lucide-icon [img]="XIcon" [size]="14" class="text-red-500"></lucide-icon>
              </button>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="mt-2 flex items-center gap-1.5">
          <lucide-icon [img]="AlertCircleIcon" [size]="12" class="text-red-500"></lucide-icon>
          <p class="text-xs text-red-600 dark:text-red-400">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbFileUpload {
  readonly label = input<string>('');
  readonly accept = input<string>('.pdf,.doc,.docx,.jpg,.png');
  readonly acceptHint = input<string>('PDF, DOC, DOCX, JPG, PNG (max 10MB each)');
  readonly multiple = input(true);
  readonly error = input<string>('');

  readonly files = signal<UploadedFile[]>([]);
  readonly dragOver = signal(false);
  readonly filesChanged = output<UploadedFile[]>();

  // Icons
  readonly UploadIcon = Upload;
  readonly FileTextIcon = FileText;
  readonly XIcon = X;
  readonly AlertCircleIcon = AlertCircle;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  private addFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: this.formatSize(f.size),
      type: f.type,
    }));
    const updated = [...this.files(), ...newFiles];
    this.files.set(updated);
    this.filesChanged.emit(updated);
  }

  removeFile(name: string) {
    const updated = this.files().filter((f) => f.name !== name);
    this.files.set(updated);
    this.filesChanged.emit(updated);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
