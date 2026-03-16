import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LucideAngularModule, User, Lock, Save, Camera } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const parent = control.parent;
    if (!parent) return null;
    const newPw = parent.get('new_password')?.value;
    const confirm = control.value;
    return newPw && confirm && newPw !== confirm ? { mismatch: true } : null;
}

@Component({
    selector: 'app-profile-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account information and security</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Profile Info Card -->
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-9 h-9 rounded-sm bg-primary-600 flex items-center justify-center">
              <lucide-icon [img]="UserIcon" [size]="18" class="text-white"></lucide-icon>
            </div>
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Profile Information</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Update your name and contact details</p>
            </div>
          </div>

          <!-- Avatar -->
          <div class="flex items-center gap-4 mb-6">
            <div class="relative">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                {{ avatarInitial() }}
              </div>
              <label
                for="avatar-upload"
                class="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Upload avatar">
                <lucide-icon [img]="CameraIcon" [size]="14" class="text-slate-500"></lucide-icon>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                class="sr-only"
                (change)="onAvatarChange($event)"
                aria-label="Avatar upload">
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ authService.currentUser()?.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ authService.currentUser()?.email }}</p>
              <p class="text-xs text-primary-600 dark:text-primary-400 mt-0.5 capitalize">{{ authService.currentUser()?.role?.display_name ?? authService.currentUser()?.role?.name ?? '' }}</p>
            </div>
          </div>

          <!-- Profile Form -->
          @if (profileSuccess()) {
            <div class="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-sm text-sm text-green-700 dark:text-green-300" role="status">
              {{ profileSuccess() }}
            </div>
          }
          @if (profileError()) {
            <div class="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ profileError() }}
            </div>
          }

          <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()" class="space-y-4">
            <!-- Name -->
            <div>
              <label for="profile-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                id="profile-name"
                type="text"
                formControlName="name"
                placeholder="Your full name"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                [class.border-red-500]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched">
              @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                <p class="mt-1 text-xs text-red-600 dark:text-red-400">Full name is required</p>
              }
            </div>

            <!-- Email (readonly) -->
            <div>
              <label for="profile-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                [value]="authService.currentUser()?.email ?? ''"
                readonly
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                aria-readonly="true">
              <p class="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <!-- Phone -->
            <div>
              <label for="profile-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                formControlName="phone"
                placeholder="+263 77 123 4567"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="profileForm.invalid || savingProfile()"
                class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                @if (savingProfile()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                } @else {
                  <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon>
                  Save Changes
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password Card -->
        <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-9 h-9 rounded-sm bg-accent-600 flex items-center justify-center">
              <lucide-icon [img]="LockIcon" [size]="18" class="text-white"></lucide-icon>
            </div>
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Change Password</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
            </div>
          </div>

          @if (passwordSuccess()) {
            <div class="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-sm text-sm text-green-700 dark:text-green-300" role="status">
              {{ passwordSuccess() }}
            </div>
          }
          @if (passwordError()) {
            <div class="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
              {{ passwordError() }}
            </div>
          }

          <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()" class="space-y-4">
            <!-- Current Password -->
            <div>
              <label for="current-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Password <span class="text-red-500">*</span>
              </label>
              <input
                id="current-password"
                type="password"
                formControlName="current_password"
                placeholder="Your current password"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                [class.border-red-500]="passwordForm.get('current_password')?.invalid && passwordForm.get('current_password')?.touched">
              @if (passwordForm.get('current_password')?.invalid && passwordForm.get('current_password')?.touched) {
                <p class="mt-1 text-xs text-red-600 dark:text-red-400">Current password is required</p>
              }
            </div>

            <!-- New Password -->
            <div>
              <label for="new-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password <span class="text-red-500">*</span>
              </label>
              <input
                id="new-password"
                type="password"
                formControlName="new_password"
                placeholder="Min. 8 characters"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                [class.border-red-500]="passwordForm.get('new_password')?.invalid && passwordForm.get('new_password')?.touched">
              @if (passwordForm.get('new_password')?.hasError('minlength') && passwordForm.get('new_password')?.touched) {
                <p class="mt-1 text-xs text-red-600 dark:text-red-400">Minimum 8 characters</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                formControlName="confirm_password"
                placeholder="Repeat new password"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                [class.border-red-500]="passwordForm.get('confirm_password')?.hasError('mismatch') && passwordForm.get('confirm_password')?.touched">
              @if (passwordForm.get('confirm_password')?.hasError('mismatch') && passwordForm.get('confirm_password')?.touched) {
                <p class="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="passwordForm.invalid || savingPassword()"
                class="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-sm hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                @if (savingPassword()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Updating...
                } @else {
                  <lucide-icon [img]="LockIcon" [size]="16"></lucide-icon>
                  Update Password
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ProfilePage implements OnInit {
    readonly authService = inject(AuthService);
    private readonly profileService = inject(ProfileService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly UserIcon = User;
    readonly LockIcon = Lock;
    readonly SaveIcon = Save;
    readonly CameraIcon = Camera;

    // State
    readonly savingProfile = signal(false);
    readonly savingPassword = signal(false);
    readonly profileSuccess = signal<string | null>(null);
    readonly profileError = signal<string | null>(null);
    readonly passwordSuccess = signal<string | null>(null);
    readonly passwordError = signal<string | null>(null);

    readonly avatarInitial = () => {
        const name = this.authService.currentUser()?.name ?? '';
        return name.charAt(0).toUpperCase() || 'U';
    };

    readonly profileForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        phone: [''],
    });

    readonly passwordForm = this.fb.group({
        current_password: ['', Validators.required],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required, passwordMatchValidator]],
    });

    ngOnInit(): void {
        const user = this.authService.currentUser();
        if (user) {
            this.profileForm.patchValue({
                name: user.name,
            });
        }
    }

    onAvatarChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            this.savingProfile.set(true);
            this.profileError.set(null);
            this.profileService.updateProfile({ avatar: base64 }).subscribe({
                next: () => {
                    this.savingProfile.set(false);
                    this.profileSuccess.set('Avatar updated successfully.');
                    setTimeout(() => this.profileSuccess.set(null), 4000);
                },
                error: (err) => {
                    this.savingProfile.set(false);
                    this.profileError.set(err?.error?.message ?? 'Failed to upload avatar.');
                },
            });
        };
        reader.readAsDataURL(file);
    }

    onProfileSubmit(): void {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.savingProfile.set(true);
        this.profileError.set(null);

        const { name, phone } = this.profileForm.getRawValue();
        this.profileService.updateProfile({ name: name!, phone: phone || undefined }).subscribe({
            next: () => {
                this.savingProfile.set(false);
                this.profileSuccess.set('Profile updated successfully.');
                setTimeout(() => this.profileSuccess.set(null), 4000);
            },
            error: (err) => {
                this.savingProfile.set(false);
                this.profileError.set(err?.error?.message ?? 'Failed to update profile. Please try again.');
            },
        });
    }

    onPasswordSubmit(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.savingPassword.set(true);
        this.passwordError.set(null);

        const { current_password, new_password, confirm_password } = this.passwordForm.getRawValue();
        this.profileService.changePassword({
            current_password: current_password!,
            new_password: new_password!,
            new_password_confirmation: confirm_password!,
        }).subscribe({
            next: () => {
                this.savingPassword.set(false);
                this.passwordForm.reset();
                this.passwordSuccess.set('Password changed successfully.');
                setTimeout(() => this.passwordSuccess.set(null), 4000);
            },
            error: (err) => {
                this.savingPassword.set(false);
                this.passwordError.set(err?.error?.message ?? 'Failed to change password. Please try again.');
            },
        });
    }
}
