import { Component, ChangeDetectionStrategy, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, X, UserPlus } from 'lucide-angular';
import { SchoolUserService } from '../services/school-user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ZbButton } from '../../../shared/components/ui/zb-button';
import { ZbInput } from '../../../shared/components/ui/zb-input';
import { SchoolRole } from '../models/school.models';

@Component({
    selector: 'app-create-school-user-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbButton, ZbInput],
    template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="onClose.emit()"></div>

      <!-- Modal -->
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <lucide-icon [img]="UserPlusIcon" [size]="18" class="text-white"></lucide-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Add School User</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Create a new user for this school</p>
            </div>
          </div>
          <button
            type="button"
            (click)="onClose.emit()"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close modal">
            <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="px-6 py-5 space-y-5">

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <zb-input label="Full Name" placeholder="John Smith" [required]="true" formControlName="name" [error]="getError('name')" />
            </div>
            <div class="col-span-2">
              <zb-input label="Email Address" type="email" placeholder="john@school.edu" [required]="true" formControlName="email" [error]="getError('email')" />
            </div>
            <zb-input label="Password" type="password" placeholder="Min. 8 characters" [required]="true" formControlName="password" [error]="getError('password')" />
            <zb-input label="Phone" type="tel" placeholder="+263 77 123 4567" formControlName="phone" />
          </div>

          <!-- Roles -->
          <div>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Roles <span class="text-red-500">*</span>
              <span class="text-slate-400 font-normal ml-1">(select all that apply)</span>
            </p>
            @if (userService.roles().length === 0) {
              <p class="text-xs text-slate-400">Loading roles...</p>
            } @else {
              <div class="grid grid-cols-2 gap-2">
                @for (role of userService.roles(); track role.id) {
                  <label
                    class="flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all"
                    [class]="isRoleSelected(role.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 dark:border-primary-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'">
                    <input
                      type="checkbox"
                      [checked]="isRoleSelected(role.id)"
                      (change)="toggleRole(role)"
                      class="w-4 h-4 rounded accent-primary-600"
                      [attr.aria-label]="role.display_name" />
                    <div>
                      <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ role.display_name }}</p>
                      <p class="text-[11px] text-slate-400">{{ role.name }}</p>
                    </div>
                  </label>
                }
              </div>
              @if (noRolesError()) {
                <p class="mt-1 text-xs text-red-600 dark:text-red-400">At least one role is required</p>
              }
            }
          </div>

          <!-- Error -->
          @if (errorMessage()) {
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage() }}</p>
          }

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <zb-button variant="ghost" type="button" (clicked)="onClose.emit()">Cancel</zb-button>
            <zb-button
              type="submit"
              [iconLeft]="UserPlusIcon"
              [loading]="userService.saving()"
              [disabled]="form.invalid || userService.saving()">
              Create User
            </zb-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateSchoolUserModal implements OnInit {
    readonly schoolId = input.required<string>();
    readonly onClose = output<void>();
    readonly onCreated = output<void>();

    readonly userService = inject(SchoolUserService);
    private readonly toast = inject(ToastService);
    private readonly fb = inject(FormBuilder);

    readonly XIcon = X;
    readonly UserPlusIcon = UserPlus;

    readonly selectedRoleIds = signal<number[]>([]);
    readonly noRolesError = signal(false);
    readonly errorMessage = signal('');

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        phone: [''],
    });

    ngOnInit(): void {
        this.userService.loadRoles();
    }

    isRoleSelected(roleId: number): boolean {
        return this.selectedRoleIds().includes(roleId);
    }

    toggleRole(role: SchoolRole): void {
        this.selectedRoleIds.update(ids =>
            ids.includes(role.id) ? ids.filter(id => id !== role.id) : [...ids, role.id]
        );
        this.noRolesError.set(false);
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        if (this.selectedRoleIds().length === 0) {
            this.noRolesError.set(true);
            return;
        }

        const values = this.form.getRawValue();
        this.errorMessage.set('');

        this.userService.createUser(this.schoolId(), {
            name: values.name!,
            email: values.email!,
            password: values.password!,
            phone: values.phone || undefined,
            role_ids: this.selectedRoleIds(),
        }).subscribe({
            next: () => {
                this.toast.success('User created successfully!');
                this.onCreated.emit();
                this.onClose.emit();
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Failed to create user. Please try again.');
            },
        });
    }

    getError(field: string): string {
        const control = this.form.get(field);
        if (!control?.touched || !control?.errors) return '';
        if (control.errors['required']) return 'This field is required';
        if (control.errors['email']) return 'Please enter a valid email';
        if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
        return '';
    }
}
