import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, LogIn, Mail, Lock, AlertCircle } from 'lucide-angular';
import { GuestLayout } from '../../layouts/guest-layout';
import { ZbCard } from '../../shared/components/ui/zb-card';
import { ZbInput } from '../../shared/components/ui/zb-input';
import { ZbButton } from '../../shared/components/ui/zb-button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, GuestLayout, ZbCard, ZbInput, ZbButton],
  template: `
    <app-guest-layout>
      <div class="w-full max-w-md animate-fade-in-up">

        <!-- Header with Logo -->
        <div class="text-center mb-8"> 
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access your dashboard
          </p>
        </div>

        <zb-card [padding]="'lg'">
          <!-- Error Alert -->
          @if (errorMessage()) {
            <div
              role="alert"
              class="mb-5 flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <lucide-icon [img]="AlertCircleIcon" [size]="16" class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage() }}</p>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
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

            <div class="flex items-center justify-between pt-1 pb-3">
              <label class="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    formControlName="remember"
                    class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600">
                  <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>

              <a routerLink="/auth/forgot-password" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Forgot password?
              </a>
            </div>

            <zb-button
              type="submit"
              [fullWidth]="true"
              [iconRight]="LogInIcon"
              [loading]="loading()"
              [disabled]="form.invalid || loading()"
            >
              Sign in
            </zb-button>
          </form>
        </zb-card>
      </div>
    </app-guest-layout>
  `,
  styles: [`
    .animate-fade-in-up {
      opacity: 0;
      animation: fade-in-up 0.5s ease-out forwards;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Icons
  readonly LogInIcon = LogIn;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly AlertCircleIcon = AlertCircle;

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: (res) => {
        this.loading.set(false);
        const redirectUrl = this.authService.redirectUrl;
        if (redirectUrl) {
          this.authService.redirectUrl = null;
          this.router.navigateByUrl(redirectUrl);
          return;
        }
        const role = res.data.user.role?.name;
        this.router.navigate([role === 'super_admin' ? '/super-admin/dashboard' : '/tenant/dashboard']);
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
    const control = this.form.get(field);
    if (!control?.touched || !control?.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['minlength']) return 'Minimum length is 6';
    return '';
  }
}
