import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast position="bottom-right" [life]="4000" />
  `,
})
export class App {}
