import { Injectable, inject } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';

/** Thin wrapper so every page raises toasts the same way. */
@Injectable({ providedIn: 'root' })
export class Notify {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Erledigt'): void {
    this.messages.add({ severity: 'success', summary, detail, life: 4000 });
  }

  info(detail: string, summary = 'Hinweis'): void {
    this.messages.add({ severity: 'info', summary, detail, life: 4000 });
  }

  warn(detail: string, summary = 'Achtung'): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  error(detail: string, summary = 'Fehlgeschlagen'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 6000 });
  }
}
