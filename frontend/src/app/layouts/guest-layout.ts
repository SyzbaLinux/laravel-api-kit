import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Menu, X, Building2, LogIn, UserPlus } from 'lucide-angular';
import { ThemeToggle } from '../shared/components/theme-toggle/theme-toggle';
import { ZbButton } from '../shared/components/ui/zb-button';

@Component({
    selector: 'app-guest-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule, ThemeToggle, ZbButton],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300">

      <!-- Decorative background blobs -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none"></div>

      <!-- Top Navigation -->
      <header class="relative z-20 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16 gap-6">

            <!-- Left: Logo + Brand -->
            <a routerLink="/" class="flex items-center gap-3 group flex-shrink-0">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-[#0072ab] to-[#41a748] rounded-lg blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <div class="relative w-9 h-9 rounded-lg overflow-hidden shadow-sm bg-white border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  <img src="logo.png" alt="Omni Learning" class="w-full h-full object-contain p-0.5">
                </div>
              </div>
              <span class="text-sm font-bold text-slate-900 dark:text-white hidden sm:block tracking-tight">Omni Learning</span>
            </a>

            <!-- Center: Central App Nav (reserved for future routes) -->
            <nav class="hidden md:flex flex-1 items-center justify-center gap-1" aria-label="Main navigation">
              <!-- Central app nav links go here -->
            </nav>

            <!-- Right: Auth actions + Theme Toggle -->
            <div class="hidden md:flex items-center gap-1 flex-shrink-0">
              <zb-button routerLink="/auth/institutions" variant="ghost" size="sm">
                <lucide-icon [img]="BuildingIcon" [size]="15"></lucide-icon>
                My School
              </zb-button>
              <zb-button routerLink="/auth/login" variant="ghost" size="sm">
                <lucide-icon [img]="LogInIcon" [size]="15"></lucide-icon>
                Login
              </zb-button>
              <zb-button routerLink="/auth/register" variant="primary" size="sm">
                <lucide-icon [img]="UserPlusIcon" [size]="15"></lucide-icon>
                Create Account
              </zb-button>
              <div class="ml-1">
                <app-theme-toggle />
              </div>
            </div>

            <!-- Mobile: Theme toggle + Hamburger -->
            <div class="md:hidden flex items-center gap-2 ml-auto">
              <app-theme-toggle />
              <button
                (click)="toggleMobile()"
                class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                [attr.aria-expanded]="isMobileOpen()"
                aria-label="Toggle navigation menu">
                @if (isMobileOpen()) {
                  <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
                } @else {
                  <lucide-icon [img]="MenuIcon" [size]="20"></lucide-icon>
                }
              </button>
            </div>

          </div>

          <!-- Mobile Menu -->
          @if (isMobileOpen()) {
            <nav class="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-1" aria-label="Mobile navigation">
              <zb-button routerLink="/auth/institutions" variant="ghost" [fullWidth]="true" (clicked)="closeMobile()">
                <lucide-icon [img]="BuildingIcon" [size]="16"></lucide-icon>
                Institutions
              </zb-button>
              <zb-button routerLink="/auth/login" variant="ghost" [fullWidth]="true" (clicked)="closeMobile()">
                <lucide-icon [img]="LogInIcon" [size]="16"></lucide-icon>
                Login
              </zb-button>
              <zb-button routerLink="/auth/register" variant="primary" [fullWidth]="true" (clicked)="closeMobile()">
                <lucide-icon [img]="UserPlusIcon" [size]="16"></lucide-icon>
                Create Account
              </zb-button>
            </nav>
          }
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 flex items-center justify-center p-6 relative z-10">
        <ng-content></ng-content>
      </main>

    </div>
  `,
})
export class GuestLayout {
    readonly isMobileOpen = signal(false);

    readonly MenuIcon = Menu;
    readonly XIcon = X;
    readonly BuildingIcon = Building2;
    readonly LogInIcon = LogIn;
    readonly UserPlusIcon = UserPlus;

    toggleMobile(): void {
        this.isMobileOpen.update(v => !v);
    }

    closeMobile(): void {
        this.isMobileOpen.set(false);
    }
}
