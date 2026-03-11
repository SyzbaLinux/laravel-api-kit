import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, Info, X } from 'lucide-angular';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Info = Info;
  readonly X = X;

  toasts: Toast[] = [];
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.idCounter++;
    this.toasts.push({ id, message, type });

    // Auto remove after 3 seconds
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getToastClass(type: string): string {
    const baseClass = 'backdrop-blur-sm border-2 ';
    switch (type) {
      case 'success':
        return baseClass + 'bg-green-50/90 border-[#008f45] text-green-900';
      case 'error':
        return baseClass + 'bg-red-50/90 border-red-500 text-red-900';
      default:
        return baseClass + 'bg-blue-50/90 border-blue-500 text-blue-900';
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'success': return this.CheckCircle;
      case 'error': return this.XCircle;
      default: return this.Info;
    }
  }
}