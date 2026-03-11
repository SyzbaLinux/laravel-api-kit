import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, School, CreditCard, Settings, LogOut, Menu, User, BarChart3, Bell, Search } from 'lucide-angular';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

@Component({
  selector: 'app-super-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, ThemeToggle],
  template: `
    <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      <!-- Mobile Menu Toggle -->
      <button
        (click)="toggleMobileMenu()"
        class="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-primary-600 text-white rounded-sm shadow-lg hover:bg-primary-700 transition-all duration-200"
        aria-label="Toggle navigation menu">
        <lucide-icon [img]="MenuIcon" [size]="22"></lucide-icon>
      </button>

      <!-- Mobile Overlay -->
      @if (isMobileOpen()) {
        <div
          (click)="toggleMobileMenu()"
          class="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity"
          aria-hidden="true">
        </div>
      }

      <!-- Sidebar -->
      <aside
        [class.translate-x-0]="isMobileOpen()"
        class="fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 transform -translate-x-full lg:translate-x-0"
        aria-label="Super Admin navigation">

        <!-- Brand -->
        <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div class="relative group flex-shrink-0">
            <div class="absolute inset-0 bg-gradient-to-r from-[#0072ab] to-[#41a748] rounded-sm blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <div class="relative w-10 h-10 rounded-sm overflow-hidden shadow-sm bg-white border border-slate-100 dark:border-slate-700">
              <img src="/favicon.png" alt="Omni Learning logo" class="w-full h-full object-contain p-0.5">
            </div>
          </div>
          <div class="overflow-hidden transition-all duration-300 whitespace-nowrap">
            <h1 class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Omni Learning</h1>
            <p class="text-[11px] text-primary-600 dark:text-primary-400 font-medium">Super Admin</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          @for (item of menuItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              (click)="closeMobile()"
              class="nav-link group flex items-center gap-3 px-3 py-2.5 rounded-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
              <div class="nav-icon w-8 h-8 flex items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
                <lucide-icon [img]="item.icon" [size]="18" class="transition-colors"></lucide-icon>
              </div>
              <span class="nav-label text-sm font-medium transition-all duration-200 whitespace-nowrap">
                {{ item.label }}
              </span>
              <div class="nav-dot ml-auto w-2 h-2 rounded-full bg-white opacity-0 transition-opacity duration-200" aria-hidden="true"></div>
            </a>
          }
        </nav>

        <!-- Footer -->
        <div class="border-t border-slate-100 dark:border-slate-800 p-3 flex-shrink-0 space-y-2">
          <div class="flex items-center justify-between gap-2.5 p-2.5 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-9 h-9 rounded-sm bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <lucide-icon [img]="UserIcon" [size]="16" class="text-white"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">{{ userName() }}</p>
                <p class="text-[11px] text-slate-400 truncate">{{ userEmail() }}</p>
              </div>
            </div>

            <button
              (click)="onLogout()"
              class="flex items-center gap-2 p-2 rounded-sm text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              aria-label="Sign out"
              title="Sign out">
              <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col lg:ml-64 transition-all duration-300">

        <!-- Top Header Bar -->
        <header class="sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg transition-colors duration-300">
          <div class="flex items-center gap-4">
            <h2 class="text-sm font-semibold text-slate-800 dark:text-white hidden sm:block">Super Admin Portal</h2>
          </div>
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <lucide-icon [img]="SearchIcon" [size]="16" class="text-slate-400" aria-hidden="true"></lucide-icon>
              <input
                type="search"
                placeholder="Search..."
                aria-label="Global search"
                class="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-48 placeholder:text-slate-400">
            </div>
            <!-- Notifications -->
            <button
              class="relative p-2 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications">
              <lucide-icon [img]="BellIcon" [size]="20" class="text-slate-500 dark:text-slate-400"></lucide-icon>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            </button>
            <app-theme-toggle />
            <!-- User avatar -->
            <button class="flex items-center gap-2 p-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="User menu">
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <lucide-icon [img]="UserIcon" [size]="16" class="text-white"></lucide-icon>
              </div>
              <span class="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">{{ userName() }}</span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main>
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .active-nav.nav-link {
      background-color: var(--color-primary-600);
      color: white;
      box-shadow: 0 1px 3px rgba(0, 114, 171, 0.3);
    }
    .active-nav.nav-link:hover {
      background-color: var(--color-primary-700);
    }
    .active-nav .nav-icon {
      background-color: rgba(255, 255, 255, 0.2);
    }
    .active-nav .nav-icon lucide-icon {
      color: white;
    }
    .active-nav .nav-label {
      color: white;
      font-weight: 600;
    }
    .active-nav .nav-dot {
      opacity: 1;
    }
  `],
})
export class SuperAdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isMobileOpen = signal(false);

  readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Platform Admin');
  readonly userEmail = computed(() => this.authService.currentUser()?.email ?? 'admin@omnilearning.com');

  // Icons
  readonly MenuIcon = Menu;
  readonly UserIcon = User;
  readonly LogOutIcon = LogOut;
  readonly BellIcon = Bell;
  readonly SearchIcon = Search;

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Schools', route: '/super-admin/schools', icon: School },
    { label: 'Plans', route: '/super-admin/plans', icon: CreditCard },
    { label: 'Analytics', route: '/super-admin/analytics', icon: BarChart3 },
    { label: 'Settings', route: '/super-admin/settings', icon: Settings },
  ];

  toggleMobileMenu(): void {
    this.isMobileOpen.update(v => !v);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        // Even if logout API fails, clear session and redirect
        this.authService.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
