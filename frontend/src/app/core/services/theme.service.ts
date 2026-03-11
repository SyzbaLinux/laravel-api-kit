import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  readonly theme: ReturnType<typeof signal<Theme>>;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.theme = signal<Theme>(this.getInitialTheme());

    effect(() => {
      const t = this.theme();
      if (this.isBrowser) {
        document.documentElement.classList.toggle('dark', t === 'dark');
        localStorage.setItem('theme', t);
      }
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
