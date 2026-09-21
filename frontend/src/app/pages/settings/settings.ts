import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from '@openng/optimus-ui/card';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CardModule, ToggleSwitchModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Einstellungen</h1>
        <p>Persönliche Einstellungen für {{ auth.user().name }}.</p>
      </header>
      <p-card header="Benachrichtigungen">
        <div class="row">
          <label for="mail">Bestätigung per E-Mail nach jeder Buchung</label>
          <p-toggleswitch inputId="mail" [ngModel]="true" />
        </div>
      </p-card>
      <p-card header="Nur im Prototyp" styleClass="mt">
        <div class="row">
          <label for="admin">Admin-Rechte (zeigt „Verwaltung“ im Profilmenü)</label>
          <p-toggleswitch inputId="admin" [ngModel]="auth.isAdmin()" (ngModelChange)="auth.setAdmin($event)" />
        </div>
      </p-card>
    </div>
  `,
  styles: `
    .row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    :host ::ng-deep .mt { margin-top: 1rem; display: block; }
  `,
})
export class Settings {
  readonly auth = inject(AuthService);
}
