import { Injectable, signal } from '@angular/core';

export type AlertType = 'danger' | 'warning' | 'info';

export interface AlertConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: AlertType;
}

export interface AlertState extends AlertConfig {
    resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
    readonly _state = signal<AlertState | null>(null);

    confirm(config: AlertConfig): Promise<boolean> {
        return new Promise((resolve) => {
            this._state.set({ ...config, type: config.type ?? 'danger', resolve });
        });
    }

    _resolve(result: boolean): void {
        this._state()?.resolve(result);
        this._state.set(null);
    }
}
