import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { LucideAngularModule, Search, School, ArrowLeft, LogIn, Mail, Lock, AlertCircle } from 'lucide-angular';
import { GuestLayout } from '../../layouts/guest-layout';
import { ZbCard } from '../../shared/components/ui/zb-card';
import { ZbInput } from '../../shared/components/ui/zb-input';
import { ZbButton } from '../../shared/components/ui/zb-button';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { environment } from '../../../environments/environment';

interface PublicSchool {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
}

@Component({
    selector: 'app-institution-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, GuestLayout, ZbCard, ZbInput, ZbButton],
    template: `
    <app-guest-layout>
      <div class="w-full max-w-md animate-fade-in-up">

        <!-- Step 1: Find Institution -->
        @if (step() === 1) {
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Find your school</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Search for your institution to sign in</p>
          </div>

          <zb-card [padding]="'lg'">
            <div [formGroup]="searchForm">
              <zb-input
                formControlName="search"
                label="School Name"
                placeholder="Type your school name..."
                [icon]="SearchIcon"
              />
            </div>

            <!-- Search Results -->
            @if (searchQuery().length >= 2) {
              <div
                class="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
                role="listbox"
                aria-label="School search results">
                @if (searching()) {
                  <div class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    Searching...
                  </div>
                } @else if (schools().length > 0) {
                  @for (school of schools(); track school.id) {
                    <button
                      type="button"
                      role="option"
                      (click)="selectSchool(school)"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        @if (school.logo) {
                          <img [src]="school.logo" [alt]="school.name" class="w-full h-full object-contain p-0.5">
                        } @else {
                          <lucide-icon [img]="SchoolIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                        }
                      </div>
                      <span class="text-sm font-medium text-slate-900 dark:text-white">{{ school.name }}</span>
                    </button>
                  }
                } @else {
                  <div class="px-4 py-4 text-sm text-center text-slate-500 dark:text-slate-400">
                    No schools found for "{{ searchQuery() }}"
                  </div>
                }
              </div>
            }
          </zb-card>

          <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Platform admin?
            <a routerLink="/auth/login" class="font-medium text-slate-900 dark:text-white hover:underline">Sign in here</a>
          </p>
        }

        <!-- Step 2: School Login -->
        @if (step() === 2) {
          <zb-button variant="ghost" size="sm" (clicked)="goBack()" class="mb-6">
            <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
            Back to school search
          </zb-button>

          <div class="text-center mb-8 mt-4">
            <div class="mx-auto mb-4 w-16 h-16 rounded-lg overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center">
              @if (selectedSchool()?.logo) {
                <img [src]="selectedSchool()?.logo ?? ''" [alt]="selectedSchool()?.name ?? ''" class="w-full h-full object-contain p-1">
              } @else {
                <lucide-icon [img]="SchoolIcon" [size]="32" class="text-primary-600"></lucide-icon>
              }
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ selectedSchool()?.name }}</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Sign in to your school portal</p>
          </div>

          <zb-card [padding]="'lg'">
            @if (errorMessage()) {
              <div
                role="alert"
                class="mb-5 flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                <lucide-icon [img]="AlertCircleIcon" [size]="16" class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"></lucide-icon>
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage() }}</p>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5" novalidate>
              <zb-input
                label="Email Address"
                type="email"
                placeholder="you@school.edu"
                formControlName="email"
                [required]="true"
                [icon]="MailIcon"
                [error]="getError('email')"
              />
              <zb-input
                label="Password"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [required]="true"
                [icon]="LockIcon"
                [error]="getError('password')"
              />

              <div class="flex justify-end pt-1 pb-3">
                <a routerLink="/auth/forgot-password" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  Forgot password?
                </a>
              </div>

              <zb-button
                type="submit"
                [fullWidth]="true"
                [iconRight]="LogInIcon"
                [loading]="loading()"
                [disabled]="loginForm.invalid || loading()"
              >
                Sign in to {{ selectedSchool()?.name }}
              </zb-button>
            </form>
          </zb-card>
        }

      </div>
    </app-guest-layout>
  `,
    styles: [`
    .animate-fade-in-up {
      opacity: 0;
      animation: fade-in-up 0.4s ease-out forwards;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class InstitutionLoginPage {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly tenantService = inject(TenantService);
    private readonly destroyRef = inject(DestroyRef);

    readonly SearchIcon = Search;
    readonly SchoolIcon = School;
    readonly ArrowLeftIcon = ArrowLeft;
    readonly LogInIcon = LogIn;
    readonly MailIcon = Mail;
    readonly LockIcon = Lock;
    readonly AlertCircleIcon = AlertCircle;

    readonly step = signal<1 | 2>(1);
    readonly searchQuery = signal('');
    readonly searching = signal(false);
    readonly schools = signal<PublicSchool[]>([]);
    readonly selectedSchool = signal<PublicSchool | null>(null);
    readonly loading = signal(false);
    readonly errorMessage = signal('');

    readonly searchForm = this.fb.group({ search: [''] });

    readonly loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    constructor() {
        this.searchForm.get('search')!.valueChanges.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            switchMap(value => {
                const q = value ?? '';
                this.searchQuery.set(q);
                if (q.length < 2) {
                    this.schools.set([]);
                    this.searching.set(false);
                    return of(null);
                }
                this.searching.set(true);
                const params = new HttpParams().set('search', q);
                return this.http
                    .get<{ data: PublicSchool[] }>(`${environment.apiUrl}/public/schools`, { params })
                    .pipe(catchError(() => of({ data: [] as PublicSchool[] })));
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(res => {
            if (res !== null) {
                this.schools.set(res.data);
            }
            this.searching.set(false);
        });
    }

    selectSchool(school: PublicSchool): void {
        this.selectedSchool.set(school);
        this.tenantService.setTenant({
            schoolId: school.id,
            schoolName: school.name,
            schoolSlug: school.slug,
        });
        this.step.set(2);
    }

    goBack(): void {
        this.step.set(1);
        this.selectedSchool.set(null);
        this.tenantService.clearTenant();
        this.errorMessage.set('');
        this.loginForm.reset();
        this.searchForm.reset();
        this.schools.set([]);
        this.searchQuery.set('');
    }

    onLogin(): void {
        if (this.loginForm.invalid || this.loading()) return;
        this.loading.set(true);
        this.errorMessage.set('');

        const { email, password } = this.loginForm.getRawValue();
        this.authService.login(email!, password!).subscribe({
            next: (res) => {
                this.loading.set(false);
                const role = res.data.user.role?.name;
                if (role === 'super_admin') {
                    this.router.navigate(['/super-admin/dashboard']);
                } else {
                    this.router.navigate(['/tenant/dashboard']);
                }
            },
            error: (err) => {
                this.loading.set(false);
                if (err.status === 401 || err.status === 422) {
                    this.errorMessage.set('Invalid email or password. Please try again.');
                } else if (err.status === 0) {
                    this.errorMessage.set('Cannot connect to server. Please check your connection.');
                } else {
                    this.errorMessage.set('An unexpected error occurred. Please try again.');
                }
            },
        });
    }

    getError(field: string): string {
        const control = this.loginForm.get(field);
        if (!control?.touched || !control?.errors) return '';
        if (control.errors['required']) return 'This field is required';
        if (control.errors['email']) return 'Please enter a valid email';
        if (control.errors['minlength']) return 'Minimum length is 6';
        return '';
    }
}
