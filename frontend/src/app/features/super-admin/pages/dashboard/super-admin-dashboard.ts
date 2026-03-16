import { Component, ChangeDetectionStrategy, inject, OnInit, AfterViewInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, School, Users, GraduationCap, CreditCard, TrendingUp, ArrowRight, Plus, Activity } from 'lucide-angular';
import { SchoolService } from '../../services/school.service';
import { ZbStatCard } from '../../../../shared/components/ui/zb-stat-card';
import { ZbCard } from '../../../../shared/components/ui/zb-card';
import { ZbButton } from '../../../../shared/components/ui/zb-button';

@Component({
    selector: 'app-super-admin-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule, ZbStatCard, ZbCard, ZbButton],
    template: `
    <!-- Page Header -->
    <div class="px-6 py-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Platform Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of all schools and platform metrics</p>
        </div>
        <zb-button [iconLeft]="PlusIcon" (clicked)="onAddSchool()">
          Add School
        </zb-button>
      </div>

      <!-- Stats Grid -->
      @if (schoolService.statsLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-28 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <zb-stat-card
            [icon]="SchoolIcon"
            [iconBg]="'bg-primary-600'"
            [value]="stats()?.totalSchools?.toString() ?? '—'"
            label="Total Schools" />

          <zb-stat-card
            [icon]="ActivityIcon"
            [iconBg]="'bg-accent-600'"
            [value]="stats()?.activeSchools?.toString() ?? '—'"
            label="Active Schools" />

          <zb-stat-card
            [icon]="GraduationCapIcon"
            [iconBg]="'bg-primary-500'"
            [value]="stats()?.totalStudents?.toString() ?? '—'"
            label="Total Students" />

          <zb-stat-card
            [icon]="UsersIcon"
            [iconBg]="'bg-accent-500'"
            [value]="stats()?.totalTeachers?.toString() ?? '—'"
            label="Total Teachers" />
        </div>
      }

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Recent Schools -->
        <div class="xl:col-span-2">
          <zb-card title="Recent Schools" subtitle="Latest schools added to the platform" [headerBorder]="true">
            @if (schoolService.statsLoading()) {
              <div class="space-y-3">
                @for (i of [1,2,3]; track i) {
                  <div class="h-16 rounded-lg animate-pulse bg-slate-100 dark:bg-slate-800"></div>
                }
              </div>
            } @else {
              <div class="space-y-3">
                @for (school of stats()?.recentSchools ?? []; track school.id) {
                  <a
                    [routerLink]="['/super-admin/schools', school.id]"
                    class="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all duration-200 group">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="SchoolIcon" [size]="18" class="text-white"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ school.name }}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ school.studentCount }} students · {{ school.teacherCount }} teachers</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                        [class]="getStatusClasses(school.status)">
                        {{ school.status }}
                      </span>
                      <lucide-icon
                        [img]="ArrowRightIcon"
                        [size]="16"
                        class="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all">
                      </lucide-icon>
                    </div>
                  </a>
                }

                @if (!stats()?.recentSchools?.length) {
                  <div class="text-center py-8">
                    <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <lucide-icon [img]="SchoolIcon" [size]="20" class="text-slate-400"></lucide-icon>
                    </div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">No schools yet</p>
                  </div>
                }
              </div>
            }

            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a routerLink="/super-admin/schools"
                 class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                View all schools
                <lucide-icon [img]="ArrowRightIcon" [size]="14"></lucide-icon>
              </a>
            </div>
          </zb-card>
        </div>

        <!-- Charts Column -->
        <div class="space-y-6">
          <!-- Donut: Plan Distribution -->
          <zb-card title="Plan Distribution" subtitle="Schools per subscription plan" [headerBorder]="true">
            <div id="chart-plans" class="min-h-[200px] flex items-center justify-center">
              @if (schoolService.statsLoading()) {
                <div class="w-7 h-7 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 animate-spin"></div>
              } @else if (!stats()?.schoolsByPlan?.length) {
                <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No plan data available</p>
              }
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a routerLink="/super-admin/plans"
                 class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Manage plans
                <lucide-icon [img]="ArrowRightIcon" [size]="14"></lucide-icon>
              </a>
            </div>
          </zb-card>

          <!-- Bar: School Status -->
          <zb-card title="School Status" subtitle="Active vs Inactive vs Suspended" [headerBorder]="true">
            <div id="chart-status" class="min-h-[180px] flex items-center justify-center">
              @if (schoolService.statsLoading()) {
                <div class="w-7 h-7 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 animate-spin"></div>
              }
            </div>
          </zb-card>

          <!-- Area: Students vs Teachers -->
          <zb-card title="User Counts" subtitle="Students and teachers platform-wide" [headerBorder]="true">
            <div id="chart-users" class="min-h-[180px] flex items-center justify-center">
              @if (schoolService.statsLoading()) {
                <div class="w-7 h-7 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 animate-spin"></div>
              }
            </div>
          </zb-card>

          <!-- Quick Actions -->
          <zb-card title="Quick Actions">
            <div class="space-y-2">
              <a routerLink="/super-admin/schools/create"
                 class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group">
                <div class="w-8 h-8 rounded-sm bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                  <lucide-icon [img]="PlusIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Register New School</span>
              </a>
              <a routerLink="/super-admin/plans"
                 class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-accent-200 dark:hover:border-accent-800 hover:bg-accent-50/50 dark:hover:bg-accent-950/20 transition-all group">
                <div class="w-8 h-8 rounded-sm bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
                  <lucide-icon [img]="CreditCardIcon" [size]="16" class="text-accent-600 dark:text-accent-400"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Manage Plans</span>
              </a>
              <a routerLink="/super-admin/analytics"
                 class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group">
                <div class="w-8 h-8 rounded-sm bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                  <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Analytics</span>
              </a>
            </div>
          </zb-card>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminDashboard implements OnInit {
    readonly schoolService = inject(SchoolService);
    private readonly router = inject(Router);

    readonly stats = this.schoolService.stats;
    private chartsRendered = signal(false);

    // Icons
    readonly SchoolIcon = School;
    readonly UsersIcon = Users;
    readonly GraduationCapIcon = GraduationCap;
    readonly CreditCardIcon = CreditCard;
    readonly TrendingUpIcon = TrendingUp;
    readonly ArrowRightIcon = ArrowRight;
    readonly PlusIcon = Plus;
    readonly ActivityIcon = Activity;

    ngOnInit(): void {
        this.schoolService.loadStats();
        // Poll until stats are loaded then render charts
        const checkAndRender = () => {
            if (!this.schoolService.statsLoading() && this.stats()) {
                setTimeout(() => this.renderCharts(), 50);
            } else {
                setTimeout(checkAndRender, 200);
            }
        };
        setTimeout(checkAndRender, 200);
    }

    private renderCharts(): void {
        if (this.chartsRendered()) return;
        const s = this.stats();
        if (!s) return;

        import('apexcharts').then(({ default: ApexCharts }) => {
            this.chartsRendered.set(true);

            // Chart 1: Donut — plan distribution
            const planEl = document.querySelector('#chart-plans') as HTMLElement | null;
            if (planEl && s.schoolsByPlan?.length) {
                planEl.innerHTML = '';
                const planChart = new ApexCharts(planEl, {
                    chart: { type: 'donut', height: 220, toolbar: { show: false } },
                    series: s.schoolsByPlan.map(p => p.count),
                    labels: s.schoolsByPlan.map(p => p.planName),
                    colors: ['#0072ab', '#41a748', '#f59e0b', '#6366f1'],
                    legend: { position: 'bottom', fontSize: '12px' },
                    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
                    plotOptions: { pie: { donut: { size: '60%' } } },
                    tooltip: { y: { formatter: (val: number) => `${val} schools` } },
                });
                planChart.render();
            }

            // Chart 2: Bar — active vs inactive vs suspended
            const statusEl = document.querySelector('#chart-status') as HTMLElement | null;
            if (statusEl) {
                statusEl.innerHTML = '';
                const inactiveCount = (s.totalSchools ?? 0) - (s.activeSchools ?? 0);
                const statusChart = new ApexCharts(statusEl, {
                    chart: { type: 'bar', height: 180, toolbar: { show: false } },
                    series: [{ name: 'Schools', data: [s.activeSchools ?? 0, inactiveCount, 0] }],
                    xaxis: { categories: ['Active', 'Inactive', 'Suspended'] },
                    colors: ['#41a748', '#94a3b8', '#ef4444'],
                    plotOptions: { bar: { distributed: true, borderRadius: 4, columnWidth: '50%' } },
                    legend: { show: false },
                    dataLabels: { enabled: false },
                    yaxis: { labels: { show: false } },
                    grid: { show: false },
                });
                statusChart.render();
            }

            // Chart 3: Bar comparison — students vs teachers
            const usersEl = document.querySelector('#chart-users') as HTMLElement | null;
            if (usersEl) {
                usersEl.innerHTML = '';
                const usersChart = new ApexCharts(usersEl, {
                    chart: { type: 'bar', height: 180, toolbar: { show: false } },
                    series: [
                        { name: 'Students', data: [s.totalStudents ?? 0] },
                        { name: 'Teachers', data: [s.totalTeachers ?? 0] },
                    ],
                    xaxis: { categories: ['Platform Total'] },
                    colors: ['#0072ab', '#41a748'],
                    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
                    dataLabels: { enabled: false },
                    legend: { position: 'top', fontSize: '12px' },
                    grid: { show: false },
                });
                usersChart.render();
            }
        }).catch(() => {
            // ApexCharts not available, graceful fallback
        });
    }

    onAddSchool(): void {
        this.router.navigate(['/super-admin/schools/create']);
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'active': return 'bg-accent-50 dark:bg-accent-950/50 text-accent-700 dark:text-accent-400';
            case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            case 'suspended': return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    getPlanBarColor(planName: string): string {
        switch (planName) {
            case 'Starter': return 'bg-accent-500';
            case 'Professional': return 'bg-primary-500';
            case 'Enterprise': return 'bg-gradient-to-r from-primary-500 to-accent-500';
            default: return 'bg-slate-400';
        }
    }

    getBarWidth(count: number): number {
        const total = this.stats()?.totalSchools ?? 1;
        return Math.max(8, (count / total) * 100);
    }
}
