import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Pencil, Power, Trash2, School, Users, GraduationCap, Mail, Phone, MapPin, CreditCard, Globe, AlertCircle, UserPlus, Trash } from 'lucide-angular';
import { SchoolService } from '../../services/school.service';
import { SchoolUserService } from '../../services/school-user.service';
import { ZbCard } from '../../../../shared/components/ui/zb-card';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbStatCard } from '../../../../shared/components/ui/zb-stat-card';
import { CreateSchoolUserModal } from '../../components/create-school-user-modal';

@Component({
    selector: 'app-school-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LucideAngularModule, ZbCard, ZbButton, ZbStatCard, CreateSchoolUserModal],
    template: `
    <div class="px-6 py-6 lg:px-8">

      @if (schoolService.loading() && !schoolService.selectedSchool()) {
        <!-- Loading State -->
        <div class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-sm bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div class="space-y-2">
              <div class="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div class="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            @for (i of [1,2,3]; track i) {
              <div class="h-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            }
          </div>
        </div>
      } @else if (schoolService.selectedSchool(); as s) {
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div class="flex items-start gap-4">
            <a routerLink="/super-admin/schools"
               class="p-2 rounded-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mt-0.5"
               aria-label="Back to schools list">
              <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
            </a>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ s.name }}</h1>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                  [class]="getStatusClasses(s.status)">
                  <span class="w-1.5 h-1.5 rounded-full" [class]="getStatusDot(s.status)" aria-hidden="true"></span>
                  {{ s.status }}
                </span>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ s.slug }} · Registered {{ s.created_at ?? s.createdAt }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <a [routerLink]="['/super-admin/schools', s.id, 'edit']">
              <zb-button variant="outline" [iconLeft]="PencilIcon" size="sm">Edit</zb-button>
            </a>
            <zb-button
              [variant]="s.status === 'active' ? 'secondary' : 'primary'"
              [iconLeft]="PowerIcon"
              size="sm"
              (clicked)="onToggleStatus(s.id, s.status)">
              {{ s.status === 'active' ? 'Deactivate' : 'Activate' }}
            </zb-button>
            <zb-button variant="danger" [iconLeft]="TrashIcon" size="sm" (clicked)="onDelete(s.id, s.name)">Delete</zb-button>
          </div>
        </div>

        <!-- Error -->
        @if (errorMessage()) {
          <div role="alert" class="mb-6 flex items-start gap-3 p-4 rounded-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
            <lucide-icon [img]="AlertCircleIcon" [size]="16" class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage() }}</p>
          </div>
        }

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <zb-stat-card [icon]="GraduationCapIcon" iconBg="bg-primary-600" [value]="(s.studentCount ?? 0).toString()" label="Total Students" />
          <zb-stat-card [icon]="UsersIcon" iconBg="bg-accent-600" [value]="(s.teacherCount ?? 0).toString()" label="Total Teachers" />
          <zb-stat-card [icon]="CreditCardIcon" iconBg="bg-primary-500" [value]="s.subscriptionPlan?.name ?? 'No Plan'" label="Subscription Plan" />
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Contact Information -->
          <zb-card title="Contact Information" [headerBorder]="true">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-sm bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="MailIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ s.email }}</p>
                </div>
              </div>

              @if (s.phone) {
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="PhoneIcon" [size]="16" class="text-accent-600 dark:text-accent-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ s.phone }}</p>
                  </div>
                </div>
              }

              @if (s.website) {
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="GlobeIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Website</p>
                    <a [href]="s.website" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                      {{ s.website }}
                    </a>
                  </div>
                </div>
              }

              @if (s.address) {
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="MapPinIcon" [size]="16" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Address</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ s.address }}
                      @if (s.city) { , {{ s.city.name }} }
                      @if (s.state) { , {{ s.state.name }} }
                      @if (s.country) { , {{ s.country.name }} }
                    </p>
                  </div>
                </div>
              }

              @if (s.educationLevel) {
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-sm bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="GraduationCapIcon" [size]="16" class="text-accent-600 dark:text-accent-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Education Level</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white capitalize">{{ s.educationLevel }}</p>
                  </div>
                </div>
              }
            </div>
          </zb-card>

          <!-- Subscription Details -->
          <zb-card title="Subscription Details" [headerBorder]="true">
            @if (s.subscriptionPlan) {
              <div class="space-y-4">
                <div class="p-4 rounded-sm bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border border-primary-100 dark:border-primary-800/50">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-lg font-bold text-slate-900 dark:text-white">{{ s.subscriptionPlan.name }}</h4>
                    <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      \${{ s.subscriptionPlan.price_monthly }}<span class="text-xs text-slate-500 font-normal">/mo</span>
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-slate-500 dark:text-slate-400 text-xs">Max Students</p>
                      <p class="font-semibold text-slate-900 dark:text-white">{{ s.subscriptionPlan.max_students }}</p>
                    </div>
                    <div>
                      <p class="text-slate-500 dark:text-slate-400 text-xs">Max Teachers</p>
                      <p class="font-semibold text-slate-900 dark:text-white">{{ s.subscriptionPlan.max_teachers }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Features Included</p>
                  <div class="flex flex-wrap gap-2">
                    @for (feature of s.subscriptionPlan.features; track feature) {
                      <span class="px-2.5 py-1 text-xs font-medium rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {{ feature }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Usage Bars -->
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-slate-500 dark:text-slate-400">Student Usage</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">{{ s.studentCount }} / {{ s.subscriptionPlan.max_students }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" [attr.aria-valuenow]="s.studentCount" [attr.aria-valuemax]="s.subscriptionPlan.max_students">
                      <div class="h-full rounded-full bg-primary-500 transition-all" [style.width.%]="getUsagePercent(s.studentCount, s.subscriptionPlan.max_students)"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-slate-500 dark:text-slate-400">Teacher Usage</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">{{ s.teacherCount }} / {{ s.subscriptionPlan.max_teachers }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" [attr.aria-valuenow]="s.teacherCount" [attr.aria-valuemax]="s.subscriptionPlan.max_teachers">
                      <div class="h-full rounded-full bg-accent-500 transition-all" [style.width.%]="getUsagePercent(s.teacherCount, s.subscriptionPlan.max_teachers)"></div>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="text-center py-6">
                <p class="text-sm text-slate-500 dark:text-slate-400">No subscription plan assigned</p>
                <a [routerLink]="['/super-admin/schools', s.id, 'edit']">
                  <zb-button variant="outline" size="sm" class="mt-3">Assign Plan</zb-button>
                </a>
              </div>
            }
          </zb-card>
        </div>

        <!-- Users Section -->
        <div class="mt-6 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">School Users</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage staff and administrators</p>
            </div>
            <zb-button size="sm" [iconLeft]="UserPlusIcon" (clicked)="showCreateUser.set(true)">Add User</zb-button>
          </div>
          <div class="px-6 py-4">

          @if (userService.loading()) {
            <div class="py-8 text-center">
              <div class="inline-block w-7 h-7 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 animate-spin"></div>
            </div>
          } @else if (userService.users().length === 0) {
            <div class="py-10 text-center">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <lucide-icon [img]="UsersIcon" [size]="20" class="text-slate-400"></lucide-icon>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400">No users yet. Add the first user to this school.</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (user of userService.users(); track user.id) {
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <span class="text-white text-xs font-bold">{{ user.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ user.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex flex-wrap gap-1 justify-end">
                      @for (role of user.roles; track role.id) {
                        <span class="px-2 py-0.5 text-[11px] font-medium rounded-sm bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">
                          {{ role.display_name }}
                        </span>
                      }
                    </div>
                    <zb-button variant="danger" size="sm" (clicked)="onDeleteUser(s.id, user.id, user.name)">Remove</zb-button>
                  </div>
                </div>
              }
            </div>
          }
          </div>
        </div>
      } @else {
        <!-- Not Found -->
        <div class="flex flex-col items-center justify-center h-64 gap-4">
          <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <lucide-icon [img]="SchoolIcon" [size]="24" class="text-slate-400"></lucide-icon>
          </div>
          <p class="text-slate-500 dark:text-slate-400">School not found</p>
          <a routerLink="/super-admin/schools">
            <zb-button variant="outline" size="sm">Back to Schools</zb-button>
          </a>
        </div>
      }
    </div>

    <!-- Create User Modal -->
    @if (showCreateUser() && schoolService.selectedSchool()) {
      <app-create-school-user-modal
        [schoolId]="schoolService.selectedSchool()!.id"
        (onClose)="showCreateUser.set(false)"
        (onCreated)="userService.loadUsers(schoolService.selectedSchool()!.id)" />
    }
  `,
})
export class SchoolDetailPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    readonly schoolService = inject(SchoolService);
    readonly userService = inject(SchoolUserService);

    readonly errorMessage = signal('');
    readonly showCreateUser = signal(false);

    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly PencilIcon = Pencil;
    readonly PowerIcon = Power;
    readonly TrashIcon = Trash2;
    readonly SchoolIcon = School;
    readonly UsersIcon = Users;
    readonly GraduationCapIcon = GraduationCap;
    readonly MailIcon = Mail;
    readonly PhoneIcon = Phone;
    readonly MapPinIcon = MapPin;
    readonly CreditCardIcon = CreditCard;
    readonly GlobeIcon = Globe;
    readonly AlertCircleIcon = AlertCircle;
    readonly UserPlusIcon = UserPlus;
    readonly DeleteIcon = Trash;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.schoolService.loadSchool(id);
            this.userService.loadUsers(id);
        }
    }

    onToggleStatus(id: string, currentStatus: string): void {
        const newStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
        this.errorMessage.set('');
        this.schoolService.toggleStatus(id, newStatus).subscribe({
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Failed to update status. Please try again.');
            },
        });
    }

    onDelete(id: string, name: string): void {
        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            this.errorMessage.set('');
            this.schoolService.deleteSchool(id).subscribe({
                next: () => this.router.navigate(['/super-admin/schools']),
                error: (err) => {
                    this.errorMessage.set(err.error?.message ?? 'Failed to delete school. Please try again.');
                },
            });
        }
    }

    onDeleteUser(schoolId: string, userId: number, name: string): void {
        if (!confirm(`Remove "${name}" from this school?`)) return;
        this.userService.deleteUser(schoolId, userId).subscribe({
            error: () => this.errorMessage.set('Failed to remove user.'),
        });
    }

    getUsagePercent(current: number, max: number): number {
        if (max === 0) return 0;
        return Math.min(100, (current / max) * 100);
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'active': return 'bg-accent-50 dark:bg-accent-950/50 text-accent-700 dark:text-accent-400';
            case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            case 'suspended': return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    getStatusDot(status: string): string {
        switch (status) {
            case 'active': return 'bg-accent-500';
            case 'inactive': return 'bg-slate-400';
            case 'suspended': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    }
}
