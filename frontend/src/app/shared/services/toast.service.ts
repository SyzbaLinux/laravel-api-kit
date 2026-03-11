import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration: number;
}

let _id = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
    readonly toasts = signal<ToastItem[]>([]);

    success(title: string, message?: string, duration = 4000): void {
        this.add({ type: 'success', title, message, duration });
    }

    error(title: string, message?: string, duration = 6000): void {
        this.add({ type: 'error', title, message, duration });
    }

    warning(title: string, message?: string, duration = 5000): void {
        this.add({ type: 'warning', title, message, duration });
    }

    info(title: string, message?: string, duration = 4000): void {
        this.add({ type: 'info', title, message, duration });
    }

    dismiss(id: number): void {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }

    private add(config: Omit<ToastItem, 'id'>): void {
        const id = ++_id;
        this.toasts.update(list => [...list, { ...config, id }]);
        setTimeout(() => this.dismiss(id), config.duration);
    }
}
