import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LucideAngularModule, CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
    selector: 'zb-toast-container',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule],
    template: `
    <div
      aria-live="polite"
      aria-atomic="false"
      class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="pointer-events-auto flex items-start gap-4 p-6 rounded-lg shadow-2xl border max-w-md w-full"
          [class]="getToastClasses(toast.type)">
          <lucide-icon
            [img]="getIcon(toast.type)"
            [size]="24"
            class="flex-shrink-0 mt-1"
            [class]="getIconClass(toast.type)">
          </lucide-icon>
          <div class="flex-1 min-w-0">
            <p class="text-base font-semibold" [class]="getTitleClass(toast.type)">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-sm mt-1 opacity-85" [class]="getMessageClass(toast.type)">{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="flex-shrink-0 p-2 rounded-lg transition-colors opacity-60 hover:opacity-100"
            [class]="getDismissClass(toast.type)"
            aria-label="Dismiss notification">
            <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ZbToastContainer {
    readonly toastService = inject(ToastService);

    readonly XIcon = X;
    readonly CheckCircleIcon = CheckCircle;
    readonly AlertCircleIcon = AlertCircle;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly InfoIcon = Info;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getIcon(type: ToastType): any {
        switch (type) {
            case 'success': return this.CheckCircleIcon;
            case 'error': return this.AlertCircleIcon;
            case 'warning': return this.AlertTriangleIcon;
            case 'info': return this.InfoIcon;
        }
    }

    getToastClasses(type: ToastType): string {
        switch (type) {
            case 'success': return 'bg-accent-50 dark:bg-accent-950/90 border-accent-200 dark:border-accent-800';
            case 'error': return 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800';
            case 'warning': return 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800';
            case 'info': return 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800';
        }
    }

    getIconClass(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-accent-600 dark:text-accent-400';
            case 'error': return 'text-red-600 dark:text-red-400';
            case 'warning': return 'text-amber-600 dark:text-amber-400';
            case 'info': return 'text-blue-600 dark:text-blue-400';
        }
    }

    getTitleClass(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-accent-800 dark:text-accent-200';
            case 'error': return 'text-red-800 dark:text-red-200';
            case 'warning': return 'text-amber-800 dark:text-amber-200';
            case 'info': return 'text-blue-800 dark:text-blue-200';
        }
    }

    getMessageClass(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-accent-700 dark:text-accent-300';
            case 'error': return 'text-red-700 dark:text-red-300';
            case 'warning': return 'text-amber-700 dark:text-amber-300';
            case 'info': return 'text-blue-700 dark:text-blue-300';
        }
    }

    getDismissClass(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900';
            case 'error': return 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900';
            case 'warning': return 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900';
            case 'info': return 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900';
        }
    }
}
