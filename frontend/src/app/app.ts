import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  TimesCircleIcon,
  TimesIcon,
} from '@openng/optimus-ui/icons';
import { ToastModule } from '@openng/optimus-ui/toast';

/**
 * The headless template rebuilds the default toast markup (same classes, so the theme styles it
 * unchanged) and adds the "Rückgängig" button for messages that carry an undo callback.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastModule,
    CheckIcon,
    ExclamationTriangleIcon,
    InfoCircleIcon,
    TimesCircleIcon,
    TimesIcon,
  ],
  template: `
    <router-outlet />
    <p-toast position="bottom-right" [life]="4000">
      <ng-template #headless let-message let-closeFn="closeFn">
        <div class="p-toast-message-content" [class]="message.contentStyleClass">
          @if (message.icon) {
            <span class="p-toast-message-icon" [class]="message.icon"></span>
          } @else {
            @switch (message.severity) {
              @case ('success') {
                <svg data-p-icon="check" class="p-toast-message-icon" aria-hidden="true"></svg>
              }
              @case ('error') {
                <svg
                  data-p-icon="times-circle"
                  class="p-toast-message-icon"
                  aria-hidden="true"
                ></svg>
              }
              @case ('warn') {
                <svg
                  data-p-icon="exclamation-triangle"
                  class="p-toast-message-icon"
                  aria-hidden="true"
                ></svg>
              }
              @default {
                <svg
                  data-p-icon="info-circle"
                  class="p-toast-message-icon"
                  aria-hidden="true"
                ></svg>
              }
            }
          }
          <div class="p-toast-message-text" [attr.data-p]="message.severity">
            <div class="p-toast-summary" [attr.data-p]="message.severity">
              {{ message.summary }}
            </div>
            <div class="p-toast-detail" [attr.data-p]="message.severity">{{ message.detail }}</div>
            @if (message.data?.undo; as undo) {
              <button type="button" class="toast-undo" (click)="closeFn($event); undo()">
                <i class="pi pi-undo" aria-hidden="true"></i> Rückgängig
              </button>
            }
          </div>
          <div>
            <button
              type="button"
              class="p-toast-close-button"
              aria-label="Schließen"
              [attr.data-p]="message.severity"
              (click)="closeFn($event)"
            >
              <svg data-p-icon="times" class="p-toast-close-icon" aria-hidden="true"></svg>
            </button>
          </div>
        </div>
      </ng-template>
    </p-toast>
  `,
})
export class App {}
