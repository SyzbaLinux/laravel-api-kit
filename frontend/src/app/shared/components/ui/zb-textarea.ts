import { Component, ChangeDetectionStrategy, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'zb-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbTextarea),
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
      <textarea
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [rows]="rows()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class]="textareaClasses"
      ></textarea>
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
export class ZbTextarea implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input(3);
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false);

  readonly value = signal('');
  readonly isDisabled = signal(false);

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  get textareaClasses(): string {
    const base = 'w-full px-4 py-2.5 rounded-lg border text-sm transition-colors resize-none focus:outline-none focus:ring-2';
    const state = this.error()
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/40 focus:border-red-500'
      : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500/40 focus:border-primary-500';
    const colors = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400';
    const disabled = this.isDisabled() ? 'opacity-60 cursor-not-allowed' : '';
    return `${base} ${state} ${colors} ${disabled}`;
  }

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
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
