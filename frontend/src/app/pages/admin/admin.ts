import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Verwaltung</h1>
      </header>

      <nav class="subnav" aria-label="Bereiche der Verwaltung">
        <a routerLink="raeume" routerLinkActive="is-active" ariaCurrentWhenActive="page"><i class="pi pi-building" aria-hidden="true"></i> Räume</a>
        <a routerLink="benutzer" routerLinkActive="is-active" ariaCurrentWhenActive="page"><i class="pi pi-users" aria-hidden="true"></i> Benutzer</a>
        <a routerLink="audit" routerLinkActive="is-active" ariaCurrentWhenActive="page"><i class="pi pi-history" aria-hidden="true"></i> Audit-Log</a>
      </nav>

      <router-outlet />
    </div>
  `,
  styles: `
    .subnav {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
      border-bottom: 2px solid var(--p-content-border-color);
      margin-bottom: 1.5rem;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        margin-bottom: -2px;
        border-bottom: 2px solid transparent;
        color: var(--p-text-muted-color);
        text-decoration: none;
        font-weight: 600;

        &:hover { color: var(--p-text-color); }
        &.is-active { color: var(--p-primary-color); border-bottom-color: var(--p-primary-color); }
      }
    }
  `,
})
export class Admin {}
