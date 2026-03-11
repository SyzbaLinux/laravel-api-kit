import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { LucideAngularModule, ChevronUp, ChevronDown, Search } from 'lucide-angular';
import { ZbButton } from './zb-button';

export interface DataTableColumn<T extends object> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  formatter?: (value: unknown) => string;
  width?: string;
}

export interface DataTableAction<T extends object> {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  callback: (item: T) => void;
  visible?: (item: T) => boolean;
}

@Component({
  selector: 'zb-datatable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [LucideAngularModule, ZbButton],
  template: `
    <div class="w-full">
      <!-- Search -->
      @if (columns().some(c => c.filterable)) {
        <div class="mb-4 relative">
          <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></lucide-icon>
          <input
            type="text"
            placeholder="Search..."
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            class="w-full pl-9 pr-4 py-2.5 text-sm rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors" />
        </div>
      }

      <!-- Table -->
      <div class="overflow-x-auto rounded-sm">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              @for (col of columns(); track col.key) {
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  [style.width]="col.width">
                  <div class="flex items-center gap-2 cursor-pointer" (click)="toggleSort(col.key)">
                    <span>{{ col.label }}</span>
                    @if (col.sortable) {
                      @if (sortColumn() === col.key.toString()) {
                        <lucide-icon
                          [img]="sortDirection() === 'asc' ? ChevronUpIcon : ChevronDownIcon"
                          [size]="16"
                          class="text-primary-600 dark:text-primary-400">
                        </lucide-icon>
                      } @else {
                        <div class="w-4 h-4 opacity-30"></div>
                      }
                    }
                  </div>
                </th>
              }
              @if (actions().length > 0) {
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (filteredData().length > 0) {
              @for (item of filteredData(); track asRecord(item)[trackBy()]) {
                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  @for (col of columns(); track col.key) {
                    <td class="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                      {{ col.formatter ? col.formatter(asRecord(item)[col.key]) : asRecord(item)[col.key] }}
                    </td>
                  }
                  @if (actions().length > 0) {
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2 flex-wrap">
                        @for (action of actions(); track action.label) {
                          @if (!action.visible || action.visible(item)) {
                            <zb-button
                              [variant]="action.variant ?? 'outline'"
                              [size]="action.size ?? 'sm'"
                              (clicked)="action.callback(item)">
                              {{ action.label }}
                            </zb-button>
                          }
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            } @else {
              <tr>
                <td [attr.colspan]="columns().length + (actions().length > 0 ? 1 : 0)" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  @if (searchQuery()) {
                    No results found for "{{ searchQuery() }}"
                  } @else {
                    No data available
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Stats -->
      <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Showing {{ filteredData().length }} of {{ data().length }} records
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ZbDatatable<T extends object> {
  // Inputs
  readonly data = input<T[]>([]);
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly actions = input<DataTableAction<T>[]>([]);
  readonly trackBy = input<string>('id');

  // State
  readonly searchQuery = signal('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Icons
  readonly SearchIcon = Search;
  readonly ChevronUpIcon = ChevronUp;
  readonly ChevronDownIcon = ChevronDown;

  // Computed
  readonly filteredData = computed(() => {
    let result = this.data();

    // Filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      const filterableColumns = this.columns().filter(c => c.filterable);

      if (filterableColumns.length > 0) {
        result = result.filter(item =>
          filterableColumns.some(col =>
            String((item as Record<string, unknown>)[col.key as string]).toLowerCase().includes(query)
          )
        );
      }
    }

    // Sort
    if (this.sortColumn()) {
      const col = this.sortColumn() as string;
      const direction = this.sortDirection();

      result = [...result].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[col];
        const bVal = (b as Record<string, unknown>)[col];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  asRecord(item: T): Record<string, unknown> {
    return item as Record<string, unknown>;
  }

  toggleSort(column: string): void {
    const col = String(column);
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }
}
