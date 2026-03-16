import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Construction } from 'lucide-angular';

@Component({
    selector: 'app-coming-soon',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule],
    template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div class="w-20 h-20 rounded-sm bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6">
        <lucide-icon [img]="ConstructionIcon" [size]="36" class="text-amber-500"></lucide-icon>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h1>
      <p class="text-slate-500 dark:text-slate-400 max-w-sm">
        <strong class="text-slate-700 dark:text-slate-300">{{ pageName }}</strong> is currently under development and will be available in a future update.
      </p>
    </div>
  `,
})
export class ComingSoon {
    private readonly route = inject(ActivatedRoute);
    readonly pageName: string = this.route.snapshot.data['pageName'] ?? 'This page';
    readonly ConstructionIcon = Construction;
}
