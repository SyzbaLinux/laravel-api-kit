import { Component, ChangeDetectionStrategy, input, output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'zb-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbInput),
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
      <div class="relative">
        @if (icon()) {
          <lucide-icon
            [img]="icon()!"
            [size]="16"
            class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          ></lucide-icon>
        }
        <input
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readonly]="readonly()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [class]="inputClasses"
        />
      </div>
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
export class ZbInput implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly icon = input<any>(null);

  readonly value = signal('');
  readonly isDisabled = signal(false);

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputClasses(): string {
    const base = 'w-full py-2.5 rounded-sm border text-sm transition-colors focus:outline-none focus:ring-2';
    const padding = this.icon() ? 'pl-10 pr-4' : 'px-4';
    const state = this.error()
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/40 focus:border-red-500'
      : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500/40 focus:border-primary-500';
    const colors = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400';
    const disabled = this.isDisabled() || this.readonly() ? 'opacity-60 cursor-not-allowed' : '';

    return `${base} ${padding} ${state} ${colors} ${disabled}`;
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
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
