import {
    Component, ChangeDetectionStrategy, OnInit, inject, signal,
    computed, PLATFORM_ID, afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
    LucideAngularModule, Users, GraduationCap, Building2,
    BookMarked, School, Calendar, Clock, TrendingUp,
    BookOpen, ChevronRight, AlertCircle, CheckCircle2,
} from 'lucide-angular';
import { DashboardService, SchoolStats } from '../../services/dashboard.service';

@Component({
    selector: 'app-tenant-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, RouterLink],
    template: `
    <div class="p-6 lg:p-8 space-y-6">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">School Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            @if (currentPeriod()) {
              {{ currentPeriod() }}
            } @else {
              Overview of your school's key metrics
            }
          </p>
        </div>
        @if (stats()?.current_term) {
          <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
            <lucide-icon [img]="CheckCircle2Icon" [size]="13"></lucide-icon>
            {{ stats()!.current_term!.name }} Active
          </span>
        }
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
            <div class="h-28 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          }
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300">
          <lucide-icon [img]="AlertCircleIcon" [size]="18" class="flex-shrink-0"></lucide-icon>
          {{ error() }}
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stat Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Students -->
          <a routerLink="/tenant/students"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <lucide-icon [img]="GraduationCapIcon" [size]="20" class="text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.students }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Students</p>
          </a>

          <!-- Teachers -->
          <a routerLink="/tenant/teachers"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <lucide-icon [img]="UsersIcon" [size]="20" class="text-purple-600 dark:text-purple-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.teachers }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Teachers</p>
          </a>

          <!-- Classes -->
          <a routerLink="/tenant/classes"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <lucide-icon [img]="SchoolIcon" [size]="20" class="text-green-600 dark:text-green-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.classes }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Classes</p>
          </a>

          <!-- Departments -->
          <a routerLink="/tenant/departments"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <lucide-icon [img]="Building2Icon" [size]="20" class="text-amber-600 dark:text-amber-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.departments }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Departments</p>
          </a>

          <!-- Subjects -->
          <a routerLink="/tenant/subjects"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                <lucide-icon [img]="BookMarkedIcon" [size]="20" class="text-rose-600 dark:text-rose-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.subjects }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Subjects <span class="text-green-500">({{ stats()!.active_subjects }} active)</span>
            </p>
          </a>

          <!-- Academic Years -->
          <a routerLink="/tenant/academic-years"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <lucide-icon [img]="CalendarIcon" [size]="20" class="text-cyan-600 dark:text-cyan-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.academic_years }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Academic Years</p>
          </a>

          <!-- Terms -->
          <a routerLink="/tenant/academic-years"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <lucide-icon [img]="BookOpenIcon" [size]="20" class="text-indigo-600 dark:text-indigo-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.terms }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Terms</p>
          </a>

          <!-- Timetable Entries -->
          <a routerLink="/tenant/timetable"
             class="group bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-sm bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <lucide-icon [img]="ClockIcon" [size]="20" class="text-orange-600 dark:text-orange-400"></lucide-icon>
              </div>
              <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-slate-300 group-hover:text-primary-500 transition-colors mt-1"></lucide-icon>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats()!.timetable_entries }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Timetable Periods</p>
          </a>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Subjects by Department - Donut Chart -->
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-primary-600"></lucide-icon>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Subjects by Department</h3>
            </div>
            @if (stats()!.charts.subjects_by_department.length === 0) {
              <div class="flex items-center justify-center h-48 text-sm text-slate-400">No departments yet</div>
            } @else {
              <div id="subjects-dept-chart" class="min-h-[220px]"></div>
            }
          </div>

          <!-- Classes by Grade - Bar Chart -->
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="SchoolIcon" [size]="16" class="text-primary-600"></lucide-icon>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Classes by Grade Level</h3>
            </div>
            @if (stats()!.charts.classes_by_grade.length === 0) {
              <div class="flex items-center justify-center h-48 text-sm text-slate-400">No classes yet</div>
            } @else {
              <div id="classes-grade-chart" class="min-h-[220px]"></div>
            }
          </div>
        </div>

        <!-- Bottom Row: Subjects by Level + Current Period Info -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Subjects by Education Level - Bar chart -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="BookMarkedIcon" [size]="16" class="text-primary-600"></lucide-icon>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Subjects by Education Level</h3>
            </div>
            @if (stats()!.charts.subjects_by_level.length === 0) {
              <div class="flex items-center justify-center h-48 text-sm text-slate-400">No subjects yet</div>
            } @else {
              <div id="subjects-level-chart" class="min-h-[200px]"></div>
            }
          </div>

          <!-- Current Period Info Panel -->
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Current Academic Period</h3>

            @if (stats()!.current_year) {
              <div class="p-4 rounded-sm bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                <p class="text-[11px] font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p class="text-base font-bold text-slate-900 dark:text-white">{{ stats()!.current_year!.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ formatDate(stats()!.current_year!.start_date) }} — {{ formatDate(stats()!.current_year!.end_date) }}
                </p>
                <div class="mt-2 flex items-center gap-1.5">
                  <div class="h-1.5 flex-1 bg-primary-100 dark:bg-primary-900 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 rounded-full transition-all"
                      [style.width]="yearProgress() + '%'">
                    </div>
                  </div>
                  <span class="text-[10px] text-primary-600 dark:text-primary-400 font-medium">{{ yearProgress() }}%</span>
                </div>
              </div>
            } @else {
              <div class="p-4 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p class="text-xs text-slate-500">No current academic year set</p>
                <a routerLink="/tenant/academic-years" class="mt-2 inline-flex text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Set current year →
                </a>
              </div>
            }

            @if (stats()!.current_term) {
              <div class="p-4 rounded-sm bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <p class="text-[11px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Current Term</p>
                <p class="text-base font-bold text-slate-900 dark:text-white">{{ stats()!.current_term!.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ formatDate(stats()!.current_term!.start_date) }} — {{ formatDate(stats()!.current_term!.end_date) }}
                </p>
                <div class="mt-2 flex items-center gap-1.5">
                  <div class="h-1.5 flex-1 bg-green-100 dark:bg-green-900 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full transition-all"
                      [style.width]="termProgress() + '%'">
                    </div>
                  </div>
                  <span class="text-[10px] text-green-600 dark:text-green-400 font-medium">{{ termProgress() }}%</span>
                </div>
              </div>
            } @else {
              <div class="p-4 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p class="text-xs text-slate-500">No current term set</p>
              </div>
            }

            <!-- Quick Actions -->
            <div class="mt-auto space-y-2">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Links</p>
              <a routerLink="/tenant/timetable" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <lucide-icon [img]="ClockIcon" [size]="14"></lucide-icon>
                Manage Timetable
              </a>
              <a routerLink="/tenant/academic-years" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <lucide-icon [img]="CalendarIcon" [size]="14"></lucide-icon>
                Academic Years & Terms
              </a>
              <a routerLink="/tenant/departments" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <lucide-icon [img]="Building2Icon" [size]="14"></lucide-icon>
                Manage Departments
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TenantDashboard implements OnInit {
    private readonly dashboardService = inject(DashboardService);
    private readonly platformId = inject(PLATFORM_ID);

    readonly GraduationCapIcon = GraduationCap;
    readonly UsersIcon = Users;
    readonly Building2Icon = Building2;
    readonly BookMarkedIcon = BookMarked;
    readonly SchoolIcon = School;
    readonly CalendarIcon = Calendar;
    readonly ClockIcon = Clock;
    readonly TrendingUpIcon = TrendingUp;
    readonly BookOpenIcon = BookOpen;
    readonly ChevronRightIcon = ChevronRight;
    readonly AlertCircleIcon = AlertCircle;
    readonly CheckCircle2Icon = CheckCircle2;

    readonly stats = signal<SchoolStats | null>(null);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    readonly currentPeriod = computed(() => {
        const s = this.stats();
        if (!s) return null;
        const parts = [];
        if (s.current_year) parts.push(s.current_year.name);
        if (s.current_term) parts.push(s.current_term.name);
        return parts.length ? parts.join(' · ') : null;
    });

    readonly yearProgress = computed(() => {
        const year = this.stats()?.current_year;
        if (!year) return 0;
        const start = new Date(year.start_date).getTime();
        const end = new Date(year.end_date).getTime();
        const now = Date.now();
        if (now <= start) return 0;
        if (now >= end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    });

    readonly termProgress = computed(() => {
        const term = this.stats()?.current_term;
        if (!term) return 0;
        const start = new Date(term.start_date).getTime();
        const end = new Date(term.end_date).getTime();
        const now = Date.now();
        if (now <= start) return 0;
        if (now >= end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    });

    constructor() {
        afterNextRender(() => {
            // Charts are rendered after DOM is ready
        });
    }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.loading.set(true);
        this.error.set(null);
        this.dashboardService.getStats().subscribe({
            next: (res) => {
                this.stats.set(res.data);
                this.loading.set(false);
                if (isPlatformBrowser(this.platformId)) {
                    setTimeout(() => this.renderCharts(), 50);
                }
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load dashboard stats.');
                this.loading.set(false);
            },
        });
    }

    private renderCharts(): void {
        const s = this.stats();
        if (!s) return;

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? '#1e293b' : '#f1f5f9';
        const tooltipBg = isDark ? '#0f172a' : '#ffffff';
        const tooltipText = isDark ? '#f1f5f9' : '#1e293b';

        // 1. Subjects by Department — Donut
        if (s.charts.subjects_by_department.length > 0) {
            const deptEl = document.querySelector('#subjects-dept-chart') as HTMLElement | null;
            if (deptEl) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                import('apexcharts').then(({ default: ApexCharts }) => {
                    const chart = new ApexCharts(deptEl, {
                        series: s.charts.subjects_by_department.map(d => d.count),
                        labels: s.charts.subjects_by_department.map(d => d.name),
                        chart: {
                            type: 'donut',
                            height: 240,
                            background: 'transparent',
                            toolbar: { show: false },
                            fontFamily: 'inherit',
                        },
                        colors: ['#0072ab', '#41a748', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'],
                        dataLabels: { enabled: false },
                        legend: {
                            position: 'bottom',
                            fontSize: '11px',
                            labels: { colors: textColor },
                            markers: { size: 8, offsetX: -2 },
                            itemMargin: { horizontal: 8 },
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '65%',
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            label: 'Total',
                                            color: textColor,
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        },
                                        value: { color: isDark ? '#f1f5f9' : '#0f172a', fontSize: '22px', fontWeight: '700' },
                                    },
                                },
                            },
                        },
                        tooltip: {
                            theme: 'none',
                            style: { fontFamily: 'inherit' },
                            fillSeriesColor: false,
                            custom: ({ seriesIndex, w }: { seriesIndex: number; w: { config: { series: number[]; labels: string[] } } }) => {
                                const val = w.config.series[seriesIndex];
                                const label = w.config.labels[seriesIndex];
                                return `<div style="background:${tooltipBg};color:${tooltipText};padding:8px 12px;border-radius:6px;font-size:12px;font-family:inherit;">
                                    <span style="font-weight:600;">${label}</span>: ${val} subject${val !== 1 ? 's' : ''}
                                </div>`;
                            },
                        },
                        stroke: { width: 2, colors: [isDark ? '#0f172a' : '#ffffff'] },
                    });
                    chart.render();
                });
            }
        }

        // 2. Classes by Grade Level — Bar
        if (s.charts.classes_by_grade.length > 0) {
            const gradeEl = document.querySelector('#classes-grade-chart') as HTMLElement | null;
            if (gradeEl) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                import('apexcharts').then(({ default: ApexCharts }) => {
                    const chart = new ApexCharts(gradeEl, {
                        series: [
                            { name: 'Classes', data: s.charts.classes_by_grade.map(g => g.count) },
                            { name: 'Capacity', data: s.charts.classes_by_grade.map(g => g.capacity) },
                        ],
                        chart: {
                            type: 'bar',
                            height: 240,
                            background: 'transparent',
                            toolbar: { show: false },
                            fontFamily: 'inherit',
                        },
                        colors: ['#0072ab', '#41a748'],
                        xaxis: {
                            categories: s.charts.classes_by_grade.map(g => g.grade),
                            labels: { style: { colors: textColor, fontSize: '11px' } },
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                        },
                        yaxis: { labels: { style: { colors: textColor, fontSize: '11px' } } },
                        grid: { borderColor: gridColor, strokeDashArray: 4 },
                        plotOptions: {
                            bar: { borderRadius: 4, columnWidth: '60%', dataLabels: { position: 'top' } },
                        },
                        dataLabels: {
                            enabled: true,
                            style: { fontSize: '10px', colors: [textColor] },
                            offsetY: -18,
                        },
                        legend: {
                            position: 'top',
                            fontSize: '11px',
                            labels: { colors: textColor },
                            markers: { size: 8 },
                        },
                        tooltip: {
                            theme: 'none',
                            style: { fontFamily: 'inherit' },
                            custom: ({ series, seriesIndex, dataPointIndex, w }: { series: number[][]; seriesIndex: number; dataPointIndex: number; w: { config: { series: { name: string }[] }; globals: { categoryLabels: string[] } } }) => {
                                const val = series[seriesIndex][dataPointIndex];
                                const name = w.config.series[seriesIndex].name;
                                const grade = w.globals.categoryLabels[dataPointIndex];
                                return `<div style="background:${tooltipBg};color:${tooltipText};padding:8px 12px;border-radius:6px;font-size:12px;font-family:inherit;">
                                    <span style="font-weight:600;">${grade}</span> — ${name}: ${val}
                                </div>`;
                            },
                        },
                        states: { hover: { filter: { type: 'lighten' } } },
                    });
                    chart.render();
                });
            }
        }

        // 3. Subjects by Education Level — Horizontal Bar
        if (s.charts.subjects_by_level.length > 0) {
            const levelEl = document.querySelector('#subjects-level-chart') as HTMLElement | null;
            if (levelEl) {
                const levelLabels: Record<string, string> = {
                    ecd: 'ECD',
                    primary: 'Primary',
                    secondary: 'Secondary',
                    all: 'All Levels',
                };
                const levelColors: Record<string, string> = {
                    ecd: '#8b5cf6',
                    primary: '#0072ab',
                    secondary: '#f59e0b',
                    all: '#41a748',
                };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                import('apexcharts').then(({ default: ApexCharts }) => {
                    const chart = new ApexCharts(levelEl, {
                        series: [{ name: 'Subjects', data: s.charts.subjects_by_level.map(l => l.count) }],
                        chart: {
                            type: 'bar',
                            height: 220,
                            background: 'transparent',
                            toolbar: { show: false },
                            fontFamily: 'inherit',
                        },
                        plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } } },
                        colors: s.charts.subjects_by_level.map(l => levelColors[l.level] ?? '#0072ab'),
                        xaxis: {
                            categories: s.charts.subjects_by_level.map(l => levelLabels[l.level] ?? l.level),
                            labels: { style: { colors: textColor, fontSize: '11px' } },
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                        },
                        yaxis: { labels: { style: { colors: textColor, fontSize: '11px' } } },
                        grid: { borderColor: gridColor, strokeDashArray: 4 },
                        dataLabels: {
                            enabled: true,
                            style: { fontSize: '11px', colors: [textColor] },
                            offsetX: 20,
                        },
                        legend: { show: false },
                        tooltip: {
                            theme: 'none',
                            style: { fontFamily: 'inherit' },
                            custom: ({ series, seriesIndex, dataPointIndex, w }: { series: number[][]; seriesIndex: number; dataPointIndex: number; w: { globals: { categoryLabels: string[] } } }) => {
                                const val = series[seriesIndex][dataPointIndex];
                                const level = w.globals.categoryLabels[dataPointIndex];
                                return `<div style="background:${tooltipBg};color:${tooltipText};padding:8px 12px;border-radius:6px;font-size:12px;font-family:inherit;">
                                    <span style="font-weight:600;">${level}</span>: ${val} subject${val !== 1 ? 's' : ''}
                                </div>`;
                            },
                        },
                    });
                    chart.render();
                });
            }
        }
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
