import {
    Component, ChangeDetectionStrategy, OnInit, inject, signal, computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    LucideAngularModule, School, BookMarked, Clock, Users,
    CheckCircle2, AlertCircle, Calendar, BookOpen,
    GraduationCap, ClipboardList,
} from 'lucide-angular';
import { DashboardService, TeacherStats } from '../../services/dashboard.service';
import { ZbStatCard } from '../../../../shared/components/ui/zb-stat-card';

@Component({
    selector: 'app-teacher-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, RouterLink, ZbStatCard],
    template: `
    <div class="p-6 lg:p-8 space-y-6">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Teacher Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            @if (currentPeriod()) {
              {{ currentPeriod() }}
            } @else {
              Your teaching overview for today
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
          @for (_ of [1,2,3,4]; track $index) {
            <div class="h-28 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          }
        </div>
        <div class="h-48 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300">
          <lucide-icon [img]="AlertCircleIcon" [size]="18" class="flex-shrink-0"></lucide-icon>
          {{ error() }}
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/tenant/classes">
            <zb-stat-card [icon]="SchoolIcon" iconBg="bg-blue-600"
              [value]="String(stats()!.classes_count)" label="Classes I Teach" />
          </a>
          <a routerLink="/tenant/subjects">
            <zb-stat-card [icon]="BookMarkedIcon" iconBg="bg-purple-600"
              [value]="String(stats()!.subjects_count)" label="Subjects I Teach" />
          </a>
          <zb-stat-card [icon]="ClockIcon" iconBg="bg-amber-500"
            [value]="String(stats()!.today_periods)" label="Periods Today" />
          <zb-stat-card [icon]="UsersIcon" iconBg="bg-green-600"
            [value]="String(stats()!.students_count)" label="Total Students" />
        </div>

        <!-- Main Content: Today's Schedule + My Classes -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Today's Schedule -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="ClipboardListIcon" [size]="16" class="text-primary-600"></lucide-icon>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Today's Schedule</h3>
              <span class="ml-auto text-[11px] text-slate-400">{{ todayLabel() }}</span>
            </div>

            @if (stats()!.today_schedule.length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <lucide-icon [img]="CalendarIcon" [size]="22" class="text-slate-400"></lucide-icon>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400">No classes scheduled for today</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (entry of stats()!.today_schedule; track entry.id) {
                  <div class="flex items-start gap-3 p-3 rounded-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                    <!-- Time -->
                    <div class="flex-shrink-0 text-center min-w-[56px]">
                      <p class="text-xs font-bold text-primary-600 dark:text-primary-400">{{ formatTime(entry.start_time) }}</p>
                      <p class="text-[10px] text-slate-400">{{ formatTime(entry.end_time) }}</p>
                    </div>
                    <!-- Divider -->
                    <div class="flex-shrink-0 flex flex-col items-center pt-0.5">
                      <div class="w-2 h-2 rounded-full bg-primary-500"></div>
                      <div class="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1"></div>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {{ entry.subject?.name ?? 'Unknown Subject' }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[11px] text-slate-500 dark:text-slate-400">
                          {{ entry.school_class?.name ?? '—' }}
                        </span>
                        @if (entry.subject?.code) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                            {{ entry.subject!.code }}
                          </span>
                        }
                      </div>
                    </div>
                    <!-- Duration -->
                    <div class="flex-shrink-0 text-[10px] text-slate-400">
                      {{ getDuration(entry.start_time, entry.end_time) }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right Panel: Academic Period + Quick Links -->
          <div class="flex flex-col gap-4">

            <!-- Current Academic Period -->
            <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Academic Period</h3>

              @if (stats()!.current_year) {
                <div class="p-3 rounded-sm bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                  <p class="text-[11px] font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-0.5">Year</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ stats()!.current_year!.name }}</p>
                  <div class="mt-2 flex items-center gap-1.5">
                    <div class="h-1.5 flex-1 bg-primary-100 dark:bg-primary-900 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-500 rounded-full" [style.width]="yearProgress() + '%'"></div>
                    </div>
                    <span class="text-[10px] text-primary-600 dark:text-primary-400 font-medium">{{ yearProgress() }}%</span>
                  </div>
                </div>
              }

              @if (stats()!.current_term) {
                <div class="p-3 rounded-sm bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <p class="text-[11px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">Term</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ stats()!.current_term!.name }}</p>
                  <div class="mt-2 flex items-center gap-1.5">
                    <div class="h-1.5 flex-1 bg-green-100 dark:bg-green-900 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 rounded-full" [style.width]="termProgress() + '%'"></div>
                    </div>
                    <span class="text-[10px] text-green-600 dark:text-green-400 font-medium">{{ termProgress() }}%</span>
                  </div>
                </div>
              }

              @if (!stats()!.current_year && !stats()!.current_term) {
                <p class="text-xs text-slate-500">No active academic period</p>
              }
            </div>

            <!-- Quick Links -->
            <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Links</h3>
              <div class="space-y-2">
                <a routerLink="/tenant/timetable" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <lucide-icon [img]="ClockIcon" [size]="14"></lucide-icon>
                  View Full Timetable
                </a>
                <a routerLink="/tenant/classes" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <lucide-icon [img]="SchoolIcon" [size]="14"></lucide-icon>
                  My Classes
                </a>
                <a routerLink="/tenant/subjects" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <lucide-icon [img]="BookMarkedIcon" [size]="14"></lucide-icon>
                  Subjects
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- My Classes -->
        @if (stats()!.my_classes.length > 0) {
          <div class="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="GraduationCapIcon" [size]="16" class="text-primary-600"></lucide-icon>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">My Classes</h3>
              <span class="ml-auto text-[11px] text-slate-400">{{ stats()!.my_classes.length }} class{{ stats()!.my_classes.length !== 1 ? 'es' : '' }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (cls of stats()!.my_classes; track cls.id) {
                <a [routerLink]="['/tenant/classes', cls.id]"
                   class="group flex flex-col gap-2 p-4 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ cls.name }}
                      </p>
                      <p class="text-[11px] text-slate-400 mt-0.5">Grade {{ cls.grade_level }}</p>
                    </div>
                    <div class="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <lucide-icon [img]="UsersIcon" [size]="12"></lucide-icon>
                      {{ cls.students_count }}
                    </div>
                  </div>
                  @if (cls.subjects.length > 0) {
                    <div class="flex flex-wrap gap-1">
                      @for (subj of cls.subjects; track subj.id) {
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                          {{ subj.code || subj.name }}
                        </span>
                      }
                    </div>
                  }
                </a>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class TeacherDashboard implements OnInit {
    private readonly dashboardService = inject(DashboardService);

    readonly String = String;

    readonly SchoolIcon = School;
    readonly BookMarkedIcon = BookMarked;
    readonly ClockIcon = Clock;
    readonly UsersIcon = Users;
    readonly CheckCircle2Icon = CheckCircle2;
    readonly AlertCircleIcon = AlertCircle;
    readonly CalendarIcon = Calendar;
    readonly BookOpenIcon = BookOpen;
    readonly GraduationCapIcon = GraduationCap;
    readonly ClipboardListIcon = ClipboardList;

    readonly stats = signal<TeacherStats | null>(null);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    readonly currentPeriod = computed(() => {
        const s = this.stats();
        if (!s) return null;
        const parts: string[] = [];
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

    readonly todayLabel = computed(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    });

    ngOnInit(): void {
        this.dashboardService.getTeacherStats().subscribe({
            next: (res) => {
                this.stats.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load dashboard stats.');
                this.loading.set(false);
            },
        });
    }

    formatTime(time: string): string {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    getDuration(start: string, end: string): string {
        if (!start || !end) return '';
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins <= 0) return '';
        if (mins < 60) return `${mins}min`;
        const h = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
    }
}
