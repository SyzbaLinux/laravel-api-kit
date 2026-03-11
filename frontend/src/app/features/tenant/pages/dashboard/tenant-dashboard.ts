import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tenant-dashboard',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">School Dashboard</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">Welcome to Greenfield Academy. Manage your students, academics, and teachers here.</p>
    </div>
  `,
})
export class TenantDashboard { }
