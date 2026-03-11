import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, School, Users, BookMarked, Plus, Trash2, User } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import { SubjectService } from '../../services/subject.service';
import { SchoolClass, Subject } from '../../../../core/models/school-admin.models';

@Component({
    selector: 'app-class-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, RouterLink],
    template: `
    <div class="p-6 lg:p-8">
      <!-- Back Button -->
      <a
        routerLink="/tenant/classes"
        class="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
        <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
        Back to Classes
      </a>

      <!-- Error Alert -->
      @if (error()) {
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Success Alert -->
      @if (successMessage()) {
        <div class="mb-4 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300" role="status">
          {{ successMessage() }}
        </div>
      }

      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Loading class details">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (schoolClass()) {
        <!-- Page Header -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <lucide-icon [img]="SchoolIcon" [size]="28" class="text-primary-600 dark:text-primary-400"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ schoolClass()!.name }}</h1>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ schoolClass()!.grade_level }}</span>
                @if (schoolClass()!.stream) {
                  <span class="text-slate-300 dark:text-slate-600">•</span>
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ schoolClass()!.stream }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <!-- Capacity -->
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <lucide-icon [img]="UsersIcon" [size]="20" class="text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Students / Capacity</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ schoolClass()!.students_count ?? 0 }} / {{ schoolClass()!.capacity }}
                </p>
              </div>
            </div>
          </div>

          <!-- Class Teacher -->
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
                <lucide-icon [img]="UserIcon" [size]="20" class="text-accent-600 dark:text-accent-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Class Teacher</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ schoolClass()!.classTeacher?.name ?? 'Not assigned' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Subjects Count -->
          <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <lucide-icon [img]="BookMarkedIcon" [size]="20" class="text-purple-600 dark:text-purple-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Subjects</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ schoolClass()!.subjects?.length ?? 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Subjects Section -->
        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Assigned Subjects</h2>
            <button
              (click)="toggleAddSubject()"
              class="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
              <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
              Add Subject
            </button>
          </div>

          <!-- Add Subject Form -->
          @if (showAddSubject()) {
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <form [formGroup]="addSubjectForm" (ngSubmit)="onAddSubject()" class="flex items-end gap-3 flex-wrap">
                <div class="flex-1 min-w-48">
                  <label for="assign-subject" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    id="assign-subject"
                    formControlName="subject_id"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                    <option [ngValue]="null">Select a subject...</option>
                    @for (subject of availableSubjects(); track subject.id) {
                      <option [ngValue]="subject.id">{{ subject.name }}</option>
                    }
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="submit"
                    [disabled]="addSubjectForm.invalid || addingSubject()"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium transition-colors">
                    @if (addingSubject()) {
                      <span class="flex items-center gap-2">
                        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Adding...
                      </span>
                    } @else {
                      Assign
                    }
                  </button>
                  <button
                    type="button"
                    (click)="toggleAddSubject()"
                    class="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Subject List -->
          @if (!schoolClass()!.subjects || schoolClass()!.subjects!.length === 0) {
            <div class="px-6 py-12 text-center">
              <lucide-icon [img]="BookMarkedIcon" [size]="24" class="text-slate-300 dark:text-slate-600 mx-auto mb-2"></lucide-icon>
              <p class="text-sm text-slate-500 dark:text-slate-400">No subjects assigned yet</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (subject of schoolClass()!.subjects!; track subject.id) {
                <div class="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="BookMarkedIcon" [size]="16" class="text-purple-600 dark:text-purple-400"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900 dark:text-white">{{ subject.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ subject.code }}</p>
                    </div>
                  </div>
                  <button
                    (click)="removeSubject(subject)"
                    class="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    [attr.aria-label]="'Remove ' + subject.name + ' from class'">
                    <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-slate-500 dark:text-slate-400">Class not found.</p>
        </div>
      }
    </div>
  `,
})
export class ClassDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly classService = inject(ClassService);
    private readonly subjectService = inject(SubjectService);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly SchoolIcon = School;
    readonly UsersIcon = Users;
    readonly BookMarkedIcon = BookMarked;
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;
    readonly UserIcon = User;

    // State
    readonly schoolClass = signal<SchoolClass | null>(null);
    readonly allSubjects = signal<Subject[]>([]);
    readonly loading = signal(false);
    readonly addingSubject = signal(false);
    readonly showAddSubject = signal(false);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly availableSubjects = computed(() => {
        const assignedIds = new Set((this.schoolClass()?.subjects ?? []).map(s => s.id));
        return this.allSubjects().filter(s => !assignedIds.has(s.id));
    });

    readonly addSubjectForm = this.fb.group({
        subject_id: [null as number | null, Validators.required],
    });

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadClass(id);
            this.loadAllSubjects();
        }
    }

    loadClass(id: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.classService.getClass(id).subscribe({
            next: (res) => {
                this.schoolClass.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to load class details.');
                this.loading.set(false);
            },
        });
    }

    loadAllSubjects(): void {
        this.subjectService.getSubjects({ per_page: 200 }).subscribe({
            next: (res) => this.allSubjects.set(res.data),
            error: () => {},
        });
    }

    toggleAddSubject(): void {
        this.showAddSubject.update(v => !v);
        this.addSubjectForm.reset({ subject_id: null });
    }

    onAddSubject(): void {
        if (this.addSubjectForm.invalid) return;
        const cls = this.schoolClass();
        if (!cls) return;

        const subjectId = this.addSubjectForm.value.subject_id;
        if (!subjectId) return;

        this.addingSubject.set(true);
        this.classService.assignSubject(cls.id, subjectId).subscribe({
            next: () => {
                this.addingSubject.set(false);
                this.showAddSubject.set(false);
                this.successMessage.set('Subject assigned successfully.');
                this.loadClass(cls.id);
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to assign subject.');
                this.addingSubject.set(false);
            },
        });
    }

    removeSubject(subject: Subject): void {
        const cls = this.schoolClass();
        if (!cls) return;
        if (!confirm(`Remove "${subject.name}" from this class?`)) return;

        this.classService.removeSubject(cls.id, subject.id).subscribe({
            next: () => {
                this.successMessage.set('Subject removed successfully.');
                this.loadClass(cls.id);
                setTimeout(() => this.successMessage.set(null), 4000);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Failed to remove subject.');
            },
        });
    }
}
