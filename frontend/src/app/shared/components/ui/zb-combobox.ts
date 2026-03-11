import {
  Component, ChangeDetectionStrategy, input, output, signal, forwardRef, ElementRef, inject, HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Search, ChevronDown, Check, X } from 'lucide-angular';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'zb-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZbCombobox),
      multi: true,
    },
  ],
  template: `
    <div class="w-full relative">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <!-- Trigger -->
      <div
        class="relative cursor-pointer"
        (click)="toggleOpen()"
      >
        <lucide-icon
          [img]="SearchIcon"
          [size]="16"
          class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        ></lucide-icon>
        <input
          type="text"
          [placeholder]="selectedOption() ? selectedOption()!.label : placeholder()"
          [value]="isOpen() ? searchTerm() : (selectedOption()?.label ?? '')"
          (input)="onSearchInput($event)"
          (focus)="openDropdown()"
          [class]="inputClasses"
          readonly
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          @if (selectedOption() && !isOpen()) {
            <button
              type="button"
              (click)="clearSelection($event)"
              class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <lucide-icon [img]="XIcon" [size]="14" class="text-slate-400"></lucide-icon>
            </button>
          }
          <lucide-icon
            [img]="ChevronDownIcon"
            [size]="16"
            class="text-slate-400 transition-transform duration-200 pointer-events-none"
            [class.rotate-180]="isOpen()"
          ></lucide-icon>
        </div>
      </div>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm shadow-lg overflow-hidden">
          <!-- Search inside dropdown -->
          <div class="p-2 border-b border-slate-100 dark:border-slate-800">
            <div class="relative">
              <lucide-icon [img]="SearchIcon" [size]="14" class="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
              <input
                #searchInput
                type="text"
                [placeholder]="'Search...'"
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
                class="w-full pl-8 pr-3 py-2 text-sm rounded-sm bg-slate-50 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/40"
              />
            </div>
          </div>

          <!-- Options -->
          <div class="max-h-48 overflow-y-auto">
            @if (filteredOptions().length === 0) {
              <div class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                No results found
              </div>
            }
            @for (option of filteredOptions(); track option.value) {
              <button
                type="button"
                (click)="selectOption(option)"
                class="w-full text-left flex items-center justify-between px-3 py-2.5 text-sm transition-colors"
                [class]="option.value === value()
                  ? 'bg-primary-500/5 text-primary-700 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <div>
                  <span class="block">{{ option.label }}</span>
                  @if (option.sublabel) {
                    <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ option.sublabel }}</span>
                  }
                </div>
                @if (option.value === value()) {
                  <lucide-icon [img]="CheckIcon" [size]="16" class="text-primary-600 dark:text-primary-400 shrink-0"></lucide-icon>
                }
              </button>
            }
          </div>
        </div>
      }

      @if (error()) {
        <p class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
  `],
})
export class ZbCombobox implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input.required<ComboboxOption[]>();
  readonly placeholder = input<string>('Select an option...');
  readonly error = input<string>('');
  readonly required = input(false);

  readonly value = signal('');
  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly isDisabled = signal(false);

  // Icons
  readonly SearchIcon = Search;
  readonly ChevronDownIcon = ChevronDown;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  private readonly el = inject(ElementRef);
  private onChange: (val: string) => void = () => { };
  private onTouchedFn: () => void = () => { };

  get inputClasses(): string {
    const base = 'w-full pl-10 pr-16 py-2.5 rounded-sm border text-sm transition-colors focus:outline-none focus:ring-2 cursor-pointer';
    const state = this.error()
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/40'
      : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500/40 focus:border-primary-500';
    const colors = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400';
    return `${base} ${state} ${colors}`;
  }

  selectedOption(): ComboboxOption | undefined {
    return this.options().find((o) => o.value === this.value());
  }

  filteredOptions(): ComboboxOption[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options();
    return this.options().filter(
      (o) => o.label.toLowerCase().includes(term) || (o.sublabel?.toLowerCase().includes(term) ?? false)
    );
  }

  toggleOpen() {
    if (this.isDisabled()) return;
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.searchTerm.set('');
    }
  }

  openDropdown() {
    if (!this.isDisabled()) this.isOpen.set(true);
  }

  onSearchInput(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    if (!this.isOpen()) this.isOpen.set(true);
  }

  selectOption(option: ComboboxOption) {
    this.value.set(option.value);
    this.onChange(option.value);
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.value.set('');
    this.onChange('');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchTerm.set('');
      this.onTouchedFn();
    }
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
