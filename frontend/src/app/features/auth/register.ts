import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-angular';
import { GuestLayout } from '../../layouts/guest-layout';
import { ZbCard } from '../../shared/components/ui/zb-card';
import { ZbInput } from '../../shared/components/ui/zb-input';
import { ZbButton } from '../../shared/components/ui/zb-button';
import { TokenService } from '../../core/services/token.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('password_confirmation')?.value;
    if (password && confirm && password !== confirm) {
        return { passwordMismatch: true };
    }
    return null;
}

@Component({
    selector: 'app-register',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, GuestLayout, ZbCard, ZbInput, ZbButton],
    template: `
    <app-guest-layout>
      <div class="w-full max-w-md animate-fade-in-up">

        @if (!success()) {
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="mx-auto mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg shadow-primary-500/10 inline-flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
              <img src="logo.png" alt="Omni Learning" class="h-14 w-auto">
            </div>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Join Omni Learning today</p>
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

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
              <zb-input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                formControlName="name"
                [required]="true"
                [icon]="UserIcon"
                [error]="getError('name')"
              />
              <zb-input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                formControlName="email"
                [required]="true"
                [icon]="MailIcon"
                [error]="getError('email')"
              />
              <zb-input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                formControlName="password"
                [required]="true"
                [icon]="LockIcon"
                [error]="getError('password')"
              />
              <zb-input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                formControlName="password_confirmation"
                [required]="true"
                [icon]="LockIcon"
                [error]="getConfirmError()"
              />

              <zb-button
                type="submit"
                [fullWidth]="true"
                [iconRight]="UserPlusIcon"
                [loading]="loading()"
                [disabled]="form.invalid || loading()"
              >
                Create Account
              </zb-button>
            </form>
          </zb-card>

          <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
            <a routerLink="/auth/login" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Sign in</a>
          </p>
        }

        <!-- Success State -->
        @if (success()) {
          <div class="text-center animate-fade-in-up">
            <div class="mx-auto mb-6 w-20 h-20 rounded-full bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
              <lucide-icon [img]="CheckCircleIcon" [size]="40" class="text-accent-600 dark:text-accent-400"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Account created!</h2>
            <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Please check your email to verify your account before signing in.
            </p>
            <a
              routerLink="/auth/login"
              class="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Go to Sign In
            </a>
          </div>
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
export class RegisterPage {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly tokenService = inject(TokenService);

    readonly UserPlusIcon = UserPlus;
    readonly MailIcon = Mail;
    readonly LockIcon = Lock;
    readonly UserIcon = User;
    readonly AlertCircleIcon = AlertCircle;
    readonly CheckCircleIcon = CheckCircle;

    readonly loading = signal(false);
    readonly errorMessage = signal('');
    readonly success = signal(false);

    readonly form = this.fb.group(
        {
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            password_confirmation: ['', [Validators.required]],
        },
        { validators: passwordMatchValidator },
    );

    onSubmit(): void {
        if (this.form.invalid || this.loading()) return;
        this.loading.set(true);
        this.errorMessage.set('');

        const payload = this.form.getRawValue();
        this.http
            .post<{ token: string; user: unknown }>(`${environment.apiUrl}/register`, payload)
            .subscribe({
                next: () => {
                    this.loading.set(false);
                    this.success.set(true);
                },
                error: (err) => {
                    this.loading.set(false);
                    if (err.status === 422 && err.error?.errors) {
                        const errors = err.error.errors;
                        const first = Object.values(errors)[0] as string[];
                        this.errorMessage.set(first[0] ?? 'Validation error.');
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
        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength as number;
            return `Minimum ${min} characters`;
        }
        if (control.errors['maxlength']) return 'Value is too long';
        return '';
    }

    getConfirmError(): string {
        const control = this.form.get('password_confirmation');
        if (!control?.touched) return '';
        if (control.errors?.['required']) return 'This field is required';
        if (this.form.errors?.['passwordMismatch'] && control.touched) return 'Passwords do not match';
        return '';
    }
}
