import { Component, ChangeDetectionStrategy, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'zb-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbCheckbox),
      multi: true,
    },
  ],
  template: `
    <label
      class="inline-flex items-start gap-3 cursor-pointer select-none"
      [class.opacity-60]="isDisabled()"
      [class.cursor-not-allowed]="isDisabled()"
      (click)="toggle()"
    >
      <div
        class="w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150"
        [class]="checked()
          ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'"
      >
        @if (checked()) {
          <lucide-icon [img]="CheckIcon" [size]="14" class="text-white"></lucide-icon>
        }
      </div>
      <div>
        @if (label()) {
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ label() }}</span>
        }
        @if (description()) {
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ description() }}</p>
        }
        <ng-content />
      </div>
    </label>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbCheckbox implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly description = input<string>('');

  readonly checked = signal(false);
  readonly isDisabled = signal(false);

  readonly CheckIcon = Check;

  private onChange: (val: boolean) => void = () => {};
  private onTouchedFn: () => void = () => {};

  toggle() {
    if (this.isDisabled()) return;
    this.checked.set(!this.checked());
    this.onChange(this.checked());
    this.onTouchedFn();
  }

  writeValue(val: boolean): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
