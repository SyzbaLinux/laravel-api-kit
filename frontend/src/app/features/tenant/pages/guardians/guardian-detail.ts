import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Phone, Mail, HeartHandshake, CheckCircle, XCircle, Users, UserPlus, Unlink } from 'lucide-angular';
import { GuardianService } from '../../services/guardian.service';
import { Guardian, Student } from '../../models/user-management.models';

@Component({
    selector: 'app-guardian-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule, ReactiveFormsModule],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/tenant/guardians"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to guardians list">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to Guardians
        </a>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20" role="status" aria-label="Loading guardian details">
          <div class="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error() && guardian()) {
        <div class="space-y-6">
          <!-- Page title -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ guardian()!.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Guardian Profile</p>
          </div>

          <!-- Profile Card -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="flex items-start gap-5">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xl font-bold">{{ guardian()!.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ guardian()!.name }}</h2>
                @if (guardian()!.guardianProfile?.relationship) {
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 capitalize mt-1">
                    {{ guardian()!.guardianProfile!.relationship }}
                  </span>
                }
                @if (guardian()!.is_active) {
                  <span class="inline-flex items-center gap-1 mt-2 ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                    <lucide-icon [img]="CheckCircleIcon" [size]="12"></lucide-icon>
                    Active
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1 mt-2 ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <lucide-icon [img]="XCircleIcon" [size]="12"></lucide-icon>
                    Inactive
                  </span>
                }
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="MailIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ guardian()!.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="PhoneIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ guardian()!.phone || '—' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="HeartHandshakeIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Relationship</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {{ guardian()!.guardianProfile?.relationship || '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Linked Students Section -->
          <div class="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <lucide-icon [img]="UsersIcon" [size]="16" class="text-slate-500 dark:text-slate-400"></lucide-icon>
              Linked Students
            </h3>

            @if (linkedStudents().length > 0) {
              <ul class="space-y-2 mb-4" aria-label="Linked students">
                @for (student of linkedStudents(); track student.id) {
                  <li class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-sm">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center flex-shrink-0">
                        <span class="text-white text-xs font-bold">{{ student.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-900 dark:text-white">{{ student.name }}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ student.email }}</p>
                      </div>
                    </div>
                    <button
                      (click)="unlinkStudent(student)"
                      [disabled]="unlinking() === student.id"
                      class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      [attr.aria-label]="'Unlink ' + student.name">
                      @if (unlinking() === student.id) {
                        <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      } @else {
                        <lucide-icon [img]="UnlinkIcon" [size]="12"></lucide-icon>
                      }
                      Unlink
                    </button>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-slate-500 dark:text-slate-400 italic mb-4">No students linked to this guardian.</p>
            }

            <!-- Link Success / Error -->
            @if (linkSuccess()) {
              <div class="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-sm text-sm text-green-700 dark:text-green-300" role="status">
                {{ linkSuccess() }}
              </div>
            }
            @if (linkError()) {
              <div class="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300" role="alert">
                {{ linkError() }}
              </div>
            }

            <!-- Link Student Form -->
            <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <lucide-icon [img]="UserPlusIcon" [size]="13"></lucide-icon>
                Link a Student
              </h4>
              <form [formGroup]="linkForm" (ngSubmit)="onLinkStudent()" class="flex items-end gap-3 flex-wrap">
                <div class="flex-1 min-w-[160px]">
                  <label for="link-student-id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student ID <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="link-student-id"
                    type="number"
                    formControlName="student_id"
                    placeholder="Enter student ID"
                    min="1"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    [class.border-red-500]="linkForm.get('student_id')?.invalid && linkForm.get('student_id')?.touched">
                </div>

                <button
                  type="submit"
                  [disabled]="linkForm.invalid || linking()"
                  class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2">
                  @if (linking()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Linking...
                  } @else {
                    Link Student
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class GuardianDetail implements OnInit {
    private readonly guardianService = inject(GuardianService);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly PhoneIcon = Phone;
    readonly MailIcon = Mail;
    readonly HeartHandshakeIcon = HeartHandshake;
    readonly CheckCircleIcon = CheckCircle;
    readonly XCircleIcon = XCircle;
    readonly UsersIcon = Users;
    readonly UserPlusIcon = UserPlus;
    readonly UnlinkIcon = Unlink;

    // State
    readonly guardian = signal<Guardian | null>(null);
    readonly linkedStudents = signal<Student[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly linking = signal(false);
    readonly unlinking = signal<number | null>(null);
    readonly linkError = signal<string | null>(null);
    readonly linkSuccess = signal<string | null>(null);

    readonly linkForm = this.fb.group({
        student_id: [null as number | null, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Guardian ID not found.');
            return;
        }
        this.loadGuardian(Number(id));
    }

    private loadGuardian(id: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.guardianService.getGuardian(id).subscribe({
            next: (res) => {
                this.guardian.set(res.data);
                this.linkedStudents.set(res.data.linkedStudents ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load guardian details.');
                this.loading.set(false);
            },
        });
    }

    onLinkStudent(): void {
        if (this.linkForm.invalid) {
            this.linkForm.markAllAsTouched();
            return;
        }

        const guardianId = this.guardian()?.id;
        const studentId = this.linkForm.getRawValue().student_id;

        if (!guardianId || !studentId) return;

        this.linking.set(true);
        this.linkError.set(null);
        this.linkSuccess.set(null);

        this.guardianService.linkStudent(guardianId, studentId).subscribe({
            next: () => {
                this.linking.set(false);
                this.linkSuccess.set('Student linked successfully.');
                this.linkForm.reset();
                this.loadGuardian(guardianId);
                setTimeout(() => this.linkSuccess.set(null), 4000);
            },
            error: (err) => {
                this.linkError.set(err?.error?.message ?? 'Failed to link student.');
                this.linking.set(false);
            },
        });
    }

    unlinkStudent(student: Student): void {
        const guardianId = this.guardian()?.id;
        if (!guardianId) return;

        this.unlinking.set(student.id);
        this.linkError.set(null);
        this.linkSuccess.set(null);

        this.guardianService.unlinkStudent(guardianId, student.id).subscribe({
            next: () => {
                this.unlinking.set(null);
                this.linkSuccess.set(`${student.name} unlinked successfully.`);
                this.loadGuardian(guardianId);
                setTimeout(() => this.linkSuccess.set(null), 4000);
            },
            error: (err) => {
                this.linkError.set(err?.error?.message ?? 'Failed to unlink student.');
                this.unlinking.set(null);
            },
        });
    }
}
