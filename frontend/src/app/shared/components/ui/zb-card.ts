import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'zb-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClasses">
      @if (title() || subtitle()) {
        <div class="mb-4" [class]="headerBorder() ? 'pb-4 border-b border-slate-200 dark:border-slate-800' : ''">
          @if (title()) {
            <h3 [class]="titleClass">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle() }}</p>
          }
        </div>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbCard {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly headerBorder = input(false);

  get titleClass(): string {
    return 'text-base font-semibold text-slate-900 dark:text-slate-50';
  }

  get cardClasses(): string {
    const base = 'bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800';
    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };
    return `${base} ${paddings[this.padding()]}`;
  }
}
