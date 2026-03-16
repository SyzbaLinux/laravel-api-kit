import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    input,
    forwardRef,
    inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DpDatePickerModule, IDatePickerConfig, CalendarValue } from 'ng2-date-picker';
import type { Dayjs } from 'dayjs';

export type DatepickerMode = 'day' | 'month' | 'daytime' | 'time';

@Component({
    selector: 'zb-datepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DpDatePickerModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ZbDatepicker),
            multi: true,
        },
    ],
    template: `
    <div class="w-full">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500" aria-hidden="true">*</span>
          }
        </label>
      }

      <dp-date-picker
        class="zb-dp"
        theme="zb"
        [config]="pickerConfig"
        [mode]="mode()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled"
        [minDate]="min() ?? ''"
        [maxDate]="max() ?? ''"
        [ngModel]="innerValue"
        (onChange)="onPickerChange($event)"
        (onBlur)="onTouched()"
        [class.zb-dp--error]="!!error()"
        [attr.aria-label]="label() || placeholder()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-required]="required()">
      </dp-date-picker>

      @if (hint() && !error()) {
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{{ error() }}</p>
      }
    </div>
  `,
    styles: [`
    :host { display: block; }
  `],
})
export class ZbDatepicker implements ControlValueAccessor {
    private readonly cd = inject(ChangeDetectorRef);

    readonly label = input<string>('');
    readonly placeholder = input<string>('Select date');
    readonly hint = input<string>('');
    readonly error = input<string>('');
    readonly required = input(false);
    readonly mode = input<DatepickerMode>('day');
    readonly min = input<string | null>(null);
    readonly max = input<string | null>(null);

    innerValue = '';
    isDisabled = false;

    readonly pickerConfig: IDatePickerConfig = {
        format: 'YYYY-MM-DD',
        closeOnSelect: true,
        firstDayOfWeek: 'mo',
        drops: 'down',
        opens: 'left',
        showGoToCurrent: true,
    };

    private onChange: (val: string) => void = () => {};
    onTouched: () => void = () => {};

    onPickerChange(event: CalendarValue): void {
        let val = '';
        if (typeof event === 'string') {
            val = event;
        } else if (event && typeof (event as Dayjs).format === 'function') {
            val = (event as Dayjs).format('YYYY-MM-DD');
        }
        this.innerValue = val;
        this.onChange(val);
        this.cd.markForCheck();
    }

    writeValue(val: string): void {
        this.innerValue = val ?? '';
        this.cd.markForCheck();
    }

    registerOnChange(fn: (val: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.cd.markForCheck();
    }
}
