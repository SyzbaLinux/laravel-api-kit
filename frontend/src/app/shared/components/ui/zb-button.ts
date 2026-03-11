import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'zb-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  host: {
    '[class.w-full]': 'fullWidth()',
  },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <lucide-icon [img]="Loader2" [size]="iconSize" class="animate-spin"></lucide-icon>
      } @else if (iconLeft()) {
        <lucide-icon [img]="iconLeft()!" [size]="iconSize"></lucide-icon>
      }
      <ng-content />
      @if (!loading() && iconRight()) {
        <lucide-icon [img]="iconRight()!" [size]="iconSize"></lucide-icon>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
  `],
})
export class ZbButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly iconLeft = input<any>(null);
  readonly iconRight = input<any>(null);
  readonly clicked = output<MouseEvent>();

  readonly Loader2 = Loader2;

  get iconSize(): number {
    return this.size() === 'sm' ? 14 : this.size() === 'lg' ? 18 : 16;
  }

  get buttonClasses(): string {
    const base = 'inline-flex rounded-sm items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-sm',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/40',
      secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500/40',
      outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500/40',
      ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500/40',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500/40',
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${width}`;
  }
}
