import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from '@openng/optimus-ui/card';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

import { AuthService } from '../../core/auth.service';
import { BootService } from '../../core/boot.service';
import { Notify } from '../../core/notify.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CardModule, ToggleSwitchModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Einstellungen</h1>
      </header>

      <p-card header="Benachrichtigungen">
        <div class="row">
          <label for="mail">E-Mail-Bestätigung bei jeder Buchung</label>
          <p-toggleswitch inputId="mail" [ngModel]="mail" (ngModelChange)="setMail($event)" />
        </div>
      </p-card>

      <p-card header="Nur im Prototyp" styleClass="mt">
        <div class="row">
          <div>
            <label for="admin">Admin-Rechte</label>
            <p class="hint">Zeigt „Verwaltung“ im Profilmenü.</p>
          </div>
          <p-toggleswitch inputId="admin" [ngModel]="auth.isAdmin()" (ngModelChange)="auth.setAdmin($event)" />
        </div>

        <div class="row">
          <div>
            <label for="fehler">Ladefehler simulieren</label>
            <p class="hint">Zeigt die Fehleransicht bei abgerissener Verbindung.</p>
          </div>
          <p-toggleswitch inputId="fehler" [ngModel]="boot.simulateError()" (ngModelChange)="simulateError($event)" />
        </div>
      </p-card>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      & + .row {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--p-content-border-color);
      }
    }

    label { font-weight: 600; }
    .hint { margin: 0.125rem 0 0; font-size: 0.875rem; color: var(--p-text-muted-color); }
    :host ::ng-deep .mt { margin-top: 1rem; display: block; }
  `,
})
export class Settings {
  readonly auth = inject(AuthService);
  readonly boot = inject(BootService);
  private readonly notify = inject(Notify);

  mail = true;

  setMail(on: boolean): void {
    this.mail = on;
    this.notify.success(on ? 'E-Mail-Bestätigung eingeschaltet.' : 'E-Mail-Bestätigung ausgeschaltet.', 'Gespeichert');
  }

  /** Switching this on reloads straight away, so the error screen is visible at once. */
  simulateError(on: boolean): void {
    this.boot.simulateError.set(on);
    if (on) this.boot.start();
    else this.notify.info('Ladefehler ausgeschaltet.');
  }
}
