import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestLayout } from '../../layouts/guest-layout';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GuestLayout],
  template: `
    <app-guest-layout>
      <div class="w-full max-w-4xl flex flex-col items-center justify-center text-center gap-8">
        <!-- Logo -->
        <div class="animate-fade-in-up">
          <div class="bg-white dark:bg-slate-900 flex items-center justify-center rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 border border-slate-100 dark:border-slate-800 px-8 py-5">
             <img src="/logo.png" alt="Omni Learning" class="h-16 lg:h-18 w-auto ">
          </div>
        </div>

        <!-- Title -->
        <div class="animate-fade-in-up delay-200">
          <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            Omni <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Learning</span>
          </h1>

          <hr class="my-8 border-slate-200 dark:border-slate-800/60 max-w-xs mx-auto">

          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for modern education management. Handle multi-tenant schools, students, teachers, parents, and administrative tasks seamlessly.
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="animate-fade-in-up delay-400 mt-6 flex flex-col sm:flex-row items-center gap-4">
          <a
            routerLink="/auth/login"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-lg bg-primary-600 text-white font-semibold text-base hover:bg-primary-700 active:bg-primary-800 hover:shadow-lg hover:shadow-primary-600/20 transition-all duration-200"
          >
            <span>Get Started</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          
          <a
            routerLink="/super-admin"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <span>Platform Dashboard</span>
          </a>
        </div>
      </div>
    </app-guest-layout>
  `,
  styles: [`
    .animate-fade-in-up {
      opacity: 0;
      animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .delay-200 { animation-delay: 0.15s; }
    .delay-400 { animation-delay: 0.3s; }

    @keyframes fade-in-up {
      from { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `],
})
export class LandingPage { }
