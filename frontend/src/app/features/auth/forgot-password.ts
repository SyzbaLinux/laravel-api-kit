import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-angular';
import { GuestLayout } from '../../layouts/guest-layout';
import { ZbCard } from '../../shared/components/ui/zb-card';
import { ZbInput } from '../../shared/components/ui/zb-input';
import { ZbButton } from '../../shared/components/ui/zb-button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, GuestLayout, ZbCard, ZbInput, ZbButton],
  template: `
    <app-guest-layout>
      <div class="w-full max-w-md animate-fade-in-up">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg shadow-primary-500/10 inline-flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
            <img src="logo.png" alt="Omni Learning" class="h-14 w-auto">
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset password
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <zb-card [padding]="'lg'">

          @if (successMessage()) {
            <!-- Success State -->
            <div class="text-center py-4">
              <div
                role="status"
                aria-live="polite"
                class="w-14 h-14 mx-auto rounded-full bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center mb-4">
                <lucide-icon [img]="CheckCircleIcon" [size]="28" class="text-accent-600 dark:text-accent-400"></lucide-icon>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Check your email</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
                We sent a password reset link to <strong class="text-slate-900 dark:text-white">{{ submittedEmail() }}</strong>
              </p>
              <a routerLink="/auth/login">
                <zb-button variant="outline" [fullWidth]="true">Back to Sign In</zb-button>
              </a>
            </div>
          } @else {
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

              <zb-button
                type="submit"
                [fullWidth]="true"
                [iconRight]="SendIcon"
                [loading]="loading()"
                [disabled]="form.invalid || loading()"
              >
                Send Reset Link
              </zb-button>
            </form>
          }
        </zb-card>

        <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remember your password?
          <a routerLink="/auth/login" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            Sign in
          </a>
        </p>
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
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // Icons
  readonly MailIcon = Mail;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly SendIcon = Send;

  readonly loading = signal(false);
  readonly successMessage = signal(false);
  readonly errorMessage = signal('');
  readonly submittedEmail = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const email = this.form.getRawValue().email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.submittedEmail.set(email);
        this.successMessage.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 422) {
          this.errorMessage.set('No account found with that email address.');
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
    return '';
  }
}
