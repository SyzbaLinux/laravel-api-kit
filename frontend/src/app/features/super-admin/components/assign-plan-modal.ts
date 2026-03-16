import { Component, ChangeDetectionStrategy, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, X, CreditCard } from 'lucide-angular';
import { PlanService } from '../services/plan.service';
import { SchoolService } from '../services/school.service';
import { ZbButton } from '../../../shared/components/ui/zb-button';

@Component({
    selector: 'app-assign-plan-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, LucideAngularModule, ZbButton, CurrencyPipe],
    template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="onClose.emit()"></div>

      <!-- Modal -->
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-sm bg-primary-600 flex items-center justify-center">
              <lucide-icon [img]="CreditCardIcon" [size]="18" class="text-white"></lucide-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Change Subscription Plan</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Select a plan to assign to this school</p>
            </div>
          </div>
          <button
            type="button"
            (click)="onClose.emit()"
            class="p-2 rounded-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close modal">
            <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="px-6 py-5 space-y-5">

          <!-- Plan Selector -->
          <div>
            <label for="plan-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subscription Plan <span class="text-red-500">*</span>
            </label>
            @if (planService.loading()) {
              <p class="text-xs text-slate-400">Loading plans...</p>
            } @else {
              <select
                id="plan-select"
                formControlName="subscription_plan_id"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                aria-required="true">
                <option [ngValue]="null">— Select a plan —</option>
                @for (plan of planService.plans(); track plan.id) {
                  <option [ngValue]="plan.id">{{ plan.name }} — {{ plan.price_monthly | currency }}/mo</option>
                }
              </select>
            }
          </div>

          <!-- Selected Plan Details -->
          @if (selectedPlan()) {
            <div class="p-4 rounded-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ selectedPlan()!.name }}</h3>
                <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {{ selectedPlan()!.price_monthly | currency }}<span class="text-xs text-slate-500 font-normal">/mo</span>
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Max Students</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ selectedPlan()!.max_students }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Max Teachers</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ selectedPlan()!.max_teachers }}</p>
                </div>
              </div>
              @if (selectedPlan()!.features.length) {
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Features</p>
                  <div class="flex flex-wrap gap-1.5">
                    @for (feature of selectedPlan()!.features; track feature) {
                      <span class="px-2 py-0.5 text-xs font-medium rounded-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                        {{ feature }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Error -->
          @if (errorMessage()) {
            <p class="text-sm text-red-600 dark:text-red-400" role="alert">{{ errorMessage() }}</p>
          }

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <zb-button variant="ghost" type="button" (clicked)="onClose.emit()">Cancel</zb-button>
            <zb-button
              type="submit"
              [iconLeft]="CreditCardIcon"
              [loading]="saving()"
              [disabled]="form.invalid || saving()">
              Assign Plan
            </zb-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AssignPlanModal implements OnInit {
    readonly schoolId = input.required<string>();
    readonly currentPlanId = input<number | null>(null);
    readonly onClose = output<void>();
    readonly onAssigned = output<void>();

    readonly planService = inject(PlanService);
    private readonly schoolService = inject(SchoolService);
    private readonly fb = inject(FormBuilder);

    readonly XIcon = X;
    readonly CreditCardIcon = CreditCard;

    readonly saving = signal(false);
    readonly errorMessage = signal('');

    readonly form = this.fb.group({
        subscription_plan_id: [null as number | null, Validators.required],
    });

    readonly selectedPlan = computed(() => {
        const id = this.form.get('subscription_plan_id')?.value;
        if (!id) return undefined;
        return this.planService.plans().find(p => p.id === id);
    });

    ngOnInit(): void {
        this.planService.getPlans();
        if (this.currentPlanId() !== null) {
            this.form.patchValue({ subscription_plan_id: this.currentPlanId() });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.saving.set(true);
        this.errorMessage.set('');

        const planId = this.form.value.subscription_plan_id ?? null;
        this.schoolService.assignPlan(this.schoolId(), planId).subscribe({
            next: () => {
                this.saving.set(false);
                this.onAssigned.emit();
                this.onClose.emit();
            },
            error: (err) => {
                this.saving.set(false);
                this.errorMessage.set(err?.error?.message ?? 'Failed to assign plan. Please try again.');
            },
        });
    }
}
