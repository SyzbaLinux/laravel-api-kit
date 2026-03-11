import { Component, ChangeDetectionStrategy, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'zb-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbSelect),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <select
        [disabled]="isDisabled()"
        [value]="value()"
        (change)="onSelect($event)"
        (blur)="onTouched()"
        [class]="selectClasses"
      >
        @if (placeholderOption()) {
          <option value="" disabled selected hidden>{{ placeholderOption() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled ?? false">{{ option.label }}</option>
        }
      </select>
      @if (hint() && !error()) {
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbSelect implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input.required<SelectOption[]>();
  readonly placeholderOption = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false);

  readonly value = signal('');
  readonly isDisabled = signal(false);

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  get selectClasses(): string {
    const base = 'w-full px-4 py-2.5 rounded-sm border text-sm transition-colors appearance-none bg-no-repeat bg-[length:16px_16px] bg-[position:right_12px_center] focus:outline-none focus:ring-2';
    const arrow = "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] pr-10";
    const state = this.error()
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/40 focus:border-red-500'
      : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500/40 focus:border-primary-500';
    const colors = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100';
    const disabled = this.isDisabled() ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

    return `${base} ${arrow} ${state} ${colors} ${disabled}`;
  }

  onSelect(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
