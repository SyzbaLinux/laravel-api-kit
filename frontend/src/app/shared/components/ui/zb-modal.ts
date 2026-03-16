import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'zb-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        (click)="close.emit()"
        aria-hidden="true">
      </div>
      <!-- Panel -->
      <div
        class="relative w-full bg-white dark:bg-slate-900 rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-visible flex flex-col max-h-[90vh]"
        [class]="panelSizeClass">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div class="flex items-center gap-3">
            @if (icon()) {
              <div class="w-8 h-8 rounded-sm bg-primary-600 flex items-center justify-center shrink-0">
                <lucide-icon [img]="icon()!" [size]="16" class="text-white"></lucide-icon>
              </div>
            }
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ title() }}</h2>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="p-1.5 rounded-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close modal">
            <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
          </button>
        </div>
        <!-- Body (scrollable) -->
        <div class="overflow-y-auto">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class ZbModal {
  readonly title = input.required<string>();
  readonly size = input<ModalSize>('md');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly icon = input<any>(null);
  readonly close = output<void>();

  readonly XIcon = X;

  get panelSizeClass(): string {
    const sizes: Record<ModalSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
    };
    return sizes[this.size()];
  }
}
