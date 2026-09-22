import { Component } from '@angular/core';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';

/** Placeholder for the shell while the prototype pretends to load its data. */
@Component({
  selector: 'app-app-skeleton',
  imports: [SkeletonModule],
  template: `
    <div class="boot" role="status" aria-live="polite">
      <span class="visually-hidden">Daten werden geladen …</span>

      <div class="boot__sidebar" aria-hidden="true">
        <div class="boot__brand">
          <p-skeleton shape="circle" size="2rem" />
          <p-skeleton width="7rem" height="1.25rem" />
        </div>
        @for (i of rows; track i) {
          <p-skeleton height="2.5rem" borderRadius="0.5rem" styleClass="boot__nav-item" />
        }
        <div class="boot__profile">
          <p-skeleton shape="circle" size="2.75rem" />
          <div class="boot__profile-text">
            <p-skeleton width="8rem" height="1rem" />
            <p-skeleton width="5rem" height="0.75rem" />
          </div>
        </div>
      </div>

      <div class="boot__main" aria-hidden="true">
        <p-skeleton width="16rem" height="2rem" styleClass="boot__title" />
        <p-skeleton width="24rem" height="1rem" styleClass="boot__subtitle" />
        <div class="boot__cards">
          @for (i of cards; track i) {
            <p-skeleton height="11rem" borderRadius="0.75rem" />
          }
        </div>
        <p-skeleton width="12rem" height="1.5rem" styleClass="boot__title" />
        @for (i of rows; track i) {
          <p-skeleton height="3.5rem" borderRadius="0.5rem" styleClass="boot__row" />
        }
      </div>
    </div>
  `,
  styles: `
    .boot {
      display: grid;
      min-height: 100vh;
      grid-template-columns: var(--app-sidebar-width) 1fr;
    }

    .boot__sidebar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.25rem 1rem;
      background: var(--p-content-background);
      border-right: 1px solid var(--p-content-border-color);
    }

    .boot__brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }

    :host ::ng-deep .boot__nav-item { margin-bottom: 0.25rem; }

    .boot__profile { margin-top: auto; display: flex; align-items: center; gap: 0.75rem; }
    .boot__profile-text { display: flex; flex-direction: column; gap: 0.375rem; }

    .boot__main { padding: 2rem; max-width: 72rem; }

    :host ::ng-deep .boot__title { margin-bottom: 0.5rem; }
    :host ::ng-deep .boot__subtitle { margin-bottom: 2rem; }
    :host ::ng-deep .boot__row { margin-bottom: 0.5rem; }

    .boot__cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 991px) {
      .boot { grid-template-columns: 1fr; }
      .boot__sidebar { display: none; }
      .boot__main { padding: 1rem; }
    }
  `,
})
export class AppSkeleton {
  readonly rows = [1, 2, 3, 4];
  readonly cards = [1, 2, 3];
}
