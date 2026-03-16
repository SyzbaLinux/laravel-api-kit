import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, X, HeartHandshake, ToggleLeft, ToggleRight, Eye } from 'lucide-angular';
import { GuardianService, CreateGuardianPayload } from '../../services/guardian.service';
import { Guardian } from '../../models/user-management.models';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';

const RELATIONSHIP_OPTIONS = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'other', label: 'Other' },
] as const;

@Component({
    selector: 'app-guardian-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, RouterLink],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Guardians</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage parents and guardians linked to students</p>
        </div>
        <button
          (click)="showCreateForm()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-sm font-medium"
          aria-label="Add new guardian">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add Guardian
        </button>
      </div>

      <!-- Inline Form -->
      @if (showForm()) {
        <div class="mb-6 bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">
              {{ editingId() ? 'Edit Guardian' : 'New Guardian' }}
            </h2>
            <button
              (click)="cancelForm()"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close form">
              <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label for="guardian-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="guardian-name"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Mary Doe"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Full name is required</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label for="guardian-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span class="text-red-500">*</span>
                </label>
                <input
                  id="guardian-email"
                  type="email"
                  formControlName="email"
                  placeholder="guardian@email.com"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched">
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Email is required</p>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Please enter a valid email</p>
                }
              </div>

              <!-- Password (create only) -->
              @if (!editingId()) {
                <div>
                  <label for="guardian-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="guardian-password"
                    type="password"
                    formControlName="password"
                    placeholder="Min. 8 characters"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched">
                  @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                    <p class="mt-1 text-xs text-red-600 dark:text-red-400">Minimum 8 characters</p>
                  }
                </div>
              }

              <!-- Phone -->
              <div>
                <label for="guardian-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  id="guardian-phone"
                  type="tel"
                  formControlName="phone"
                  placeholder="+263 77 123 4567"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
              </div>

              <!-- Relationship -->
              <div>
                <label for="guardian-rel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <select
                  id="guardian-rel"
                  formControlName="relationship"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                  <option value="">— Select relationship —</option>
                  @for (opt of relationshipOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                @if (submitting()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                } @else {
                  {{ editingId() ? 'Update Guardian' : 'Create Guardian' }}
                }
              </button>
              <button
                type="button"
                (click)="cancelForm()"
                class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading guardians">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        @if (guardians().length === 0) {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="HeartHandshakeIcon" [size]="28" class="text-slate-400"></lucide-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">No guardians yet</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Add parents and guardians to manage student access.</p>
          </div>
        } @else {
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table class="w-full text-sm" aria-label="Guardians table">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Relationship</th>
                  <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" class="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (guardian of guardians(); track guardian.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span class="text-white text-xs font-bold">{{ guardian.name.charAt(0).toUpperCase() }}</span>
                        </div>
                        <span class="font-medium text-slate-900 dark:text-white">{{ guardian.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {{ guardian.email }}
                    </td>
                    <td class="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {{ guardian.phone || '—' }}
                    </td>
                    <td class="px-4 py-3.5 hidden lg:table-cell">
                      @if (guardian.guardianProfile?.relationship) {
                        <span class="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          {{ guardian.guardianProfile!.relationship }}
                        </span>
                      } @else {
                        <span class="text-slate-400 text-xs">—</span>
                      }
                    </td>
                    <td class="px-4 py-3.5">
                      @if (guardian.is_active) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                          <lucide-icon [img]="ToggleRightIcon" [size]="14"></lucide-icon>
                          Active
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <lucide-icon [img]="ToggleLeftIcon" [size]="14"></lucide-icon>
                          Inactive
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center justify-end gap-2 flex-wrap">
                        <a
                          [routerLink]="['/tenant/guardians', guardian.id]"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          [attr.aria-label]="'View ' + guardian.name">
                          <lucide-icon [img]="EyeIcon" [size]="13"></lucide-icon>
                          View
                        </a>
                        <button
                          (click)="editGuardian(guardian)"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          [attr.aria-label]="'Edit ' + guardian.name">
                          <lucide-icon [img]="EditIcon" [size]="13"></lucide-icon>
                          Edit
                        </button>
                        <button
                          (click)="deleteGuardian(guardian)"
                          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          [attr.aria-label]="'Delete ' + guardian.name">
                          <lucide-icon [img]="TrashIcon" [size]="13"></lucide-icon>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination info -->
          @if (meta()) {
            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400 text-right">
              Showing {{ guardians().length }} of {{ meta()!.total }} guardians
            </p>
          }
        }
      }
    </div>
  `,
})
export class GuardianList implements OnInit {
    private readonly guardianService = inject(GuardianService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly alertService = inject(AlertService);

    // Icons
    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly XIcon = X;
    readonly HeartHandshakeIcon = HeartHandshake;
    readonly ToggleLeftIcon = ToggleLeft;
    readonly ToggleRightIcon = ToggleRight;
    readonly EyeIcon = Eye;

    readonly relationshipOptions = RELATIONSHIP_OPTIONS;

    // State
    readonly guardians = signal<Guardian[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly showForm = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly meta = signal<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.minLength(8)]],
        phone: [''],
        relationship: [''],
    });

    ngOnInit(): void {
        this.loadGuardians();
    }

    loadGuardians(): void {
        this.loading.set(true);
        this.guardianService.getGuardians({ per_page: 50 }).subscribe({
            next: (res) => {
                this.guardians.set(res.data.data);
                this.meta.set({
                    current_page: res.data.current_page,
                    last_page: res.data.last_page,
                    per_page: res.data.per_page,
                    total: res.data.total,
                });
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to load guardians. Please try again.');
                this.loading.set(false);
            },
        });
    }

    showCreateForm(): void {
        this.editingId.set(null);
        this.form.reset();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
        this.showForm.set(true);
    }

    editGuardian(guardian: Guardian): void {
        this.editingId.set(guardian.id);
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.form.patchValue({
            name: guardian.name,
            email: guardian.email,
            phone: guardian.phone ?? '',
            relationship: guardian.guardianProfile?.relationship ?? '',
        });
        this.showForm.set(true);
    }

    cancelForm(): void {
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);

        const values = this.form.getRawValue();
        const id = this.editingId();

        const payload: CreateGuardianPayload = {
            name: values.name!,
            email: values.email!,
            phone: values.phone || undefined,
            relationship: values.relationship || undefined,
        };

        if (values.password) {
            payload.password = values.password;
        }

        const request = id
            ? this.guardianService.updateGuardian(id, payload)
            : this.guardianService.createGuardian(payload);

        request.subscribe({
            next: () => {
                this.submitting.set(false);
                this.showForm.set(false);
                this.editingId.set(null);
                this.form.reset();
                this.toast.success(id ? 'Guardian updated successfully.' : 'Guardian created successfully.');
                this.loadGuardians();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to save guardian. Please try again.');
                this.submitting.set(false);
            },
        });
    }

    async deleteGuardian(guardian: Guardian): Promise<void> {
        const confirmed = await this.alertService.confirm({ title: 'Confirm', message: `Are you sure you want to delete "${guardian.name}"? This action cannot be undone.`, confirmText: 'Delete', type: 'danger' });
        if (!confirmed) return;

        this.guardianService.deleteGuardian(guardian.id).subscribe({
            next: () => {
                this.toast.success('Guardian deleted successfully.');
                this.loadGuardians();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message ?? 'Failed to delete guardian.');
            },
        });
    }
}
