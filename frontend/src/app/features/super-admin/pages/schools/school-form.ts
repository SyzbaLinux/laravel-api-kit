import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, effect, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LucideAngularModule, ArrowLeft, Save } from 'lucide-angular';
import { SchoolService } from '../../services/school.service';
import { LocationService } from '../../../../core/services/location.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ZbCard } from '../../../../shared/components/ui/zb-card';
import { ZbButton } from '../../../../shared/components/ui/zb-button';
import { ZbInput } from '../../../../shared/components/ui/zb-input';
import { ZbSelect, SelectOption } from '../../../../shared/components/ui/zb-select';
import { ZbCombobox, ComboboxOption } from '../../../../shared/components/ui/zb-combobox';
import { EducationLevel } from '../../models/school.models';

@Component({
    selector: 'app-school-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, ZbCard, ZbButton, ZbInput, ZbSelect, ZbCombobox],
    template: `
    @if (isEditMode() && schoolService.loading()) {
      <!-- Loading Overlay -->
      <div class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-4 border-slate-700 border-t-primary-400 animate-spin"></div>
          <p class="text-white font-medium">Loading school data...</p>
        </div>
      </div>
    }

    <div class="px-6 py-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/super-admin/schools"
           class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
           aria-label="Back to schools">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ isEditMode() ? 'Edit School' : 'Register New School' }}</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ isEditMode() ? 'Update school information' : 'Add a new school to the platform' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">

          <!-- Left: School Information -->
          <zb-card title="School Information" subtitle="Basic details about the school" [headerBorder]="true" class="xl:col-span-3">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div class="col-span-2 md:col-span-3">
                <zb-input
                  label="School Name"
                  placeholder="e.g. Greenfield Academy"
                  [required]="true"
                  formControlName="name"
                  [error]="getError('name')" />
              </div>

              <zb-input
                label="Email Address"
                type="email"
                placeholder="admin@school.edu"
                [required]="true"
                formControlName="email"
                [error]="getError('email')" />

              <zb-input
                label="Phone Number"
                type="tel"
                placeholder="+263 77 123 4567"
                formControlName="phone"
                [error]="getError('phone')" />

              <zb-input
                label="Website"
                type="url"
                placeholder="https://school.edu"
                formControlName="website"
                [error]="getError('website')" />

              <zb-select
                label="Education Level"
                [options]="educationLevelOptions"
                placeholderOption="Select education level..."
                formControlName="educationLevel" />

              <zb-select
                label="Subscription Plan"
                [options]="planOptions()"
                placeholderOption="Select a plan..."
                formControlName="subscriptionPlanId" />
            </div>
          </zb-card>

          <!-- Right: Capacity + Location -->
          <div class="xl:col-span-2 flex flex-col gap-6">

            <!-- Capacity -->
            <zb-card title="Capacity Limits" subtitle="Maximum students and teachers" [headerBorder]="true">
              <div class="grid grid-cols-2 gap-5">
                <zb-input
                  label="Max Students"
                  type="number"
                  placeholder="500"
                  formControlName="maxStudents"
                  [error]="getError('maxStudents')" />

                <zb-input
                  label="Max Teachers"
                  type="number"
                  placeholder="50"
                  formControlName="maxTeachers"
                  [error]="getError('maxTeachers')" />
              </div>
            </zb-card>

            <!-- Location -->
            <zb-card title="Location" subtitle="Physical address of the school" [headerBorder]="true">
              <div class="grid grid-cols-1 gap-5">
                <zb-input
                  label="Street Address"
                  placeholder="12 Samora Machel Ave"
                  formControlName="address"
                  [error]="getError('address')" />

                <zb-combobox
                  label="Country"
                  [options]="countryOptions()"
                  [placeholder]="locationService.countriesLoading() ? 'Loading...' : 'Search country...'"
                  formControlName="countryId" />

                <zb-select
                  label="Province / State"
                  [options]="stateOptions()"
                  [placeholderOption]="locationService.statesLoading() ? 'Loading...' : stateOptions().length ? 'Select province/state...' : 'Select a country first'"
                  [disabled]="!form.get('countryId')?.value || locationService.statesLoading()"
                  formControlName="stateId" />

                <zb-select
                  label="City"
                  [options]="cityOptions()"
                  [placeholderOption]="locationService.citiesLoading() ? 'Loading...' : cityOptions().length ? 'Select city...' : 'Select a province first'"
                  [disabled]="!form.get('stateId')?.value || locationService.citiesLoading()"
                  formControlName="cityId" />
              </div>
            </zb-card>

          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2">
          <a routerLink="/super-admin/schools">
            <zb-button variant="ghost">Cancel</zb-button>
          </a>
          <zb-button
            type="submit"
            [iconLeft]="SaveIcon"
            [disabled]="form.invalid || schoolService.loading()"
            [loading]="schoolService.loading()">
            {{ isEditMode() ? 'Update School' : 'Create School' }}
          </zb-button>
        </div>
      </form>
    </div>
  `,
})
export class SchoolFormPage implements OnInit, OnDestroy {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);
    readonly schoolService = inject(SchoolService);
    readonly locationService = inject(LocationService);

    readonly isEditMode = signal(false);
    private schoolId = '';

    readonly ArrowLeftIcon = ArrowLeft;
    readonly SaveIcon = Save;

    readonly educationLevelOptions: SelectOption[] = [
        { value: 'ecd', label: 'ECD (Early Childhood Development)' },
        { value: 'primary', label: 'Primary School' },
        { value: 'secondary', label: 'Secondary School' },
        { value: 'combined', label: 'Combined (Multi-level)' },
    ];

    readonly countryOptions = computed<ComboboxOption[]>(() =>
        this.locationService.countries().map(c => ({ value: String(c.id), label: c.name }))
    );

    readonly stateOptions = computed<SelectOption[]>(() =>
        this.locationService.states().map(s => ({ value: String(s.id), label: s.name }))
    );

    readonly cityOptions = computed<SelectOption[]>(() =>
        this.locationService.cities().map(c => ({ value: String(c.id), label: c.name }))
    );

    readonly planOptions = computed<SelectOption[]>(() =>
        this.schoolService.plans().map(p => ({
            value: String(p.id),
            label: `${p.name} ($${p.price_monthly}/mo)`,
        }))
    );

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        website: [''],
        educationLevel: ['' as EducationLevel | ''],
        address: [''],
        countryId: [''],
        stateId: [''],
        cityId: [''],
        maxStudents: [500, [Validators.min(1)]],
        maxTeachers: [50, [Validators.min(1)]],
        subscriptionPlanId: [''],
    });

    private readonly subs = new Subscription();

    constructor() {
        effect(() => {
            const school = this.schoolService.selectedSchool();
            if (school && this.isEditMode() && String(school.id) === this.schoolId) {
                // Load location hierarchies first if available
                if (school.country_id) {
                    this.locationService.loadStates(school.country_id);
                }
                if (school.state_id) {
                    this.locationService.loadCities(school.state_id);
                }

                // Patch form values after a brief delay to allow location data to load
                setTimeout(() => {
                    this.form.patchValue({
                        name: school.name,
                        email: school.email,
                        phone: school.phone ?? '',
                        website: school.website ?? '',
                        educationLevel: (school.education_level ?? school.educationLevel) ?? '',
                        address: school.address ?? '',
                        countryId: school.country_id ? String(school.country_id) : '',
                        stateId: school.state_id ? String(school.state_id) : '',
                        cityId: school.city_id ? String(school.city_id) : '',
                        maxStudents: (school.max_students ?? school.maxStudents) ?? 500,
                        maxTeachers: (school.max_teachers ?? school.maxTeachers) ?? 50,
                        subscriptionPlanId: (school.subscription_plan_id ?? school.subscriptionPlanId) ? String(school.subscription_plan_id ?? school.subscriptionPlanId) : (school.subscriptionPlan?.id ? String(school.subscriptionPlan.id) : ''),
                    }, { emitEvent: false });
                }, 100);
            }
        });
    }

    ngOnInit(): void {
        this.schoolService.loadPlans();
        this.locationService.loadCountries();

        this.subs.add(
            this.form.get('countryId')!.valueChanges.subscribe(val => {
                this.form.patchValue({ stateId: '', cityId: '' }, { emitEvent: false });
                if (val) this.locationService.loadStates(Number(val));
                else this.locationService.clearStates();
            })
        );

        this.subs.add(
            this.form.get('stateId')!.valueChanges.subscribe(val => {
                this.form.patchValue({ cityId: '' }, { emitEvent: false });
                if (val) this.locationService.loadCities(Number(val));
                else this.locationService.clearCities();
            })
        );

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.schoolId = id;
            this.schoolService.loadSchool(id);
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            console.warn('Form is invalid', this.form.errors);
            return;
        }
        if (this.schoolService.loading()) {
            console.warn('Service is loading');
            return;
        }

        const values = this.form.getRawValue();
        const payload = {
            name: values.name!,
            email: values.email!,
            phone: values.phone || undefined,
            website: values.website || undefined,
            education_level: (values.educationLevel as EducationLevel) || undefined,
            address: values.address || undefined,
            country_id: values.countryId ? Number(values.countryId) : undefined,
            state_id: values.stateId ? Number(values.stateId) : undefined,
            city_id: values.cityId ? Number(values.cityId) : undefined,
            max_students: values.maxStudents ?? undefined,
            max_teachers: values.maxTeachers ?? undefined,
            subscription_plan_id: values.subscriptionPlanId ? Number(values.subscriptionPlanId) : undefined,
        };

        if (this.isEditMode()) {
            console.log('Updating school:', this.schoolId, payload);
            this.schoolService.updateSchool(this.schoolId, payload).subscribe({
                next: (res) => {
                    console.log('Update successful:', res);
                    this.toast.success('School updated successfully!');
                },
                error: (err) => {
                    console.error('Update error:', err);
                    const errorMsg = err.error?.message || err.message || JSON.stringify(err.error?.errors || err);
                    this.toast.error('Failed to update school', errorMsg);
                },
            });
        } else {
            console.log('Creating school:', payload);
            this.schoolService.createSchool(payload).subscribe({
                next: (res) => {
                    console.log('Create successful:', res);
                    this.toast.success('School created successfully!');
                    this.router.navigate(['/super-admin/schools']);
                },
                error: (err) => {
                    console.error('Create error:', err);
                    const errorMsg = err.error?.message || err.message || JSON.stringify(err.error?.errors || err);
                    this.toast.error('Failed to create school', errorMsg);
                },
            });
        }
    }

    getError(field: string): string {
        const control = this.form.get(field);
        if (!control?.touched || !control?.errors) return '';
        if (control.errors['required']) return 'This field is required';
        if (control.errors['email']) return 'Please enter a valid email';
        if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
        if (control.errors['min']) return `Must be at least ${control.errors['min'].min}`;
        return '';
    }
}
