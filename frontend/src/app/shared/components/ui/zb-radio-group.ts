import { Component, ChangeDetectionStrategy, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'zb-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbRadioGroup),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <div [class]="layout() === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'">
        @for (option of options(); track option.value) {
          <label
            (click)="selectOption(option.value)"
            class="flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all"
            [class]="value() === option.value
              ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 ring-1 ring-primary-500/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'"
          >
            <div
              class="w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              [class]="value() === option.value
                ? 'border-primary-600 dark:border-primary-400'
                : 'border-slate-300 dark:border-slate-600'"
            >
              @if (value() === option.value) {
                <div class="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
              }
            </div>
            <div>
              <span class="text-sm font-medium" [class]="value() === option.value ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'">
                {{ option.label }}
              </span>
              @if (option.description) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ option.description }}</p>
              }
            </div>
          </label>
        }
      </div>
      @if (error()) {
        <p class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbRadioGroup implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input.required<RadioOption[]>();
  readonly layout = input<'horizontal' | 'vertical'>('horizontal');
  readonly error = input<string>('');
  readonly required = input(false);

  readonly value = signal('');
  readonly isDisabled = signal(false);

  private onChange: (val: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  selectOption(val: string) {
    if (this.isDisabled()) return;
    this.value.set(val);
    this.onChange(val);
    this.onTouchedFn();
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
