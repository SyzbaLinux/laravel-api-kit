import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZbToastContainer } from './shared/components/ui/zb-toast-container';
import { ZbAlertContainer } from './shared/components/ui/zb-alert-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZbToastContainer, ZbAlertContainer],
  template: `
    <router-outlet />
    <zb-toast-container />
    <zb-alert-container />
  `,
})
export class App { }
