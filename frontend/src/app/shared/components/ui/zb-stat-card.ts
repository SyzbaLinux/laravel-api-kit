import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'zb-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="relative bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow overflow-hidden">
      <div class="absolute top-0 right-0 w-18 h-12 rounded-bl-lg flex items-center justify-center" [class]="iconBg()">
        <lucide-icon [img]="icon()" [size]="24" class="text-white"></lucide-icon>
      </div>
      <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ value() }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ label() }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ZbStatCard {
  readonly icon = input.required<any>();
  readonly iconBg = input<string>('bg-primary-600');
  readonly value = input.required<string>();
  readonly label = input.required<string>();
}
