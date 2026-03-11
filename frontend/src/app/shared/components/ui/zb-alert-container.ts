import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LucideAngularModule, AlertTriangle, AlertCircle, Info } from 'lucide-angular';
import { AlertService, AlertType } from '../../services/alert.service';

@Component({
    selector: 'zb-alert-container',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule],
    template: `
    @if (alertService._state(); as alert) {
      <div
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="zb-alert-title"
        aria-describedby="zb-alert-message">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="alertService._resolve(false)"
          aria-hidden="true">
        </div>
        <!-- Dialog -->
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              [class]="getIconBg(alert.type)">
              <lucide-icon [img]="getIcon(alert.type)" [size]="24" [class]="getIconColor(alert.type)"></lucide-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h2 id="zb-alert-title" class="text-base font-bold text-slate-900 dark:text-white">{{ alert.title }}</h2>
              <p id="zb-alert-message" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ alert.message }}</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              (click)="alertService._resolve(false)"
              class="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {{ alert.cancelText ?? 'Cancel' }}
            </button>
            <button
              type="button"
              (click)="alertService._resolve(true)"
              class="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
              [class]="getConfirmBg(alert.type)">
              {{ alert.confirmText ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ZbAlertContainer {
    readonly alertService = inject(AlertService);

    readonly AlertTriangleIcon = AlertTriangle;
    readonly AlertCircleIcon = AlertCircle;
    readonly InfoIcon = Info;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getIcon(type?: AlertType): any {
        switch (type) {
            case 'warning': return this.AlertTriangleIcon;
            case 'info': return this.InfoIcon;
            default: return this.AlertCircleIcon;
        }
    }

    getIconBg(type?: AlertType): string {
        switch (type) {
            case 'warning': return 'bg-amber-100 dark:bg-amber-950/40';
            case 'info': return 'bg-blue-100 dark:bg-blue-950/40';
            default: return 'bg-red-100 dark:bg-red-950/40';
        }
    }

    getIconColor(type?: AlertType): string {
        switch (type) {
            case 'warning': return 'text-amber-600 dark:text-amber-400';
            case 'info': return 'text-blue-600 dark:text-blue-400';
            default: return 'text-red-600 dark:text-red-400';
        }
    }

    getConfirmBg(type?: AlertType): string {
        switch (type) {
            case 'warning': return 'bg-amber-500 hover:bg-amber-600';
            case 'info': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-red-500 hover:bg-red-600';
        }
    }
}
