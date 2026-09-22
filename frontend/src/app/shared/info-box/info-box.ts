import { Component } from '@angular/core';

/** Shared note box for explanatory text, marked with an "i" in the corner. */
@Component({
  selector: 'app-info-box',
  template: `
    <aside class="info" role="note">
      <span class="visually-hidden">Hinweis:</span>
      <span class="info__badge" aria-hidden="true"><i class="pi pi-info-circle"></i></span>
      <div class="info__text"><ng-content /></div>
    </aside>
  `,
  styles: `
    :host { display: block; }

    .info {
      // Both themes only override these four values.
      --info-bg: color-mix(in srgb, var(--p-blue-500, #3b82f6) 7%, var(--p-content-background));
      --info-border: color-mix(in srgb, var(--p-blue-500, #3b82f6) 22%, transparent);
      --info-accent: var(--p-blue-500, #3b82f6);
      --info-icon: var(--p-blue-600, #2563eb);

      position: relative;
      padding: 0.875rem 3rem 0.875rem 1rem;
      border: 1px solid var(--info-border);
      border-left: 4px solid var(--info-accent);
      border-radius: 0.5rem;
      background: var(--info-bg);
      color: var(--p-text-color);
    }

    :root.app-dark .info {
      --info-bg: color-mix(in srgb, var(--p-blue-400, #60a5fa) 12%, var(--p-content-background));
      --info-border: color-mix(in srgb, var(--p-blue-400, #60a5fa) 30%, transparent);
      --info-accent: var(--p-blue-400, #60a5fa);
      --info-icon: var(--p-blue-300, #93c5fd);
    }

    .info__badge {
      position: absolute;
      top: 0.625rem;
      right: 0.75rem;
      display: grid;
      place-items: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: color-mix(in srgb, var(--info-accent) 16%, transparent);
      color: var(--info-icon);
      font-size: 0.875rem;
    }

    // Slotted content keeps its own markup but loses stray outer margins.
    .info__text ::ng-deep p { margin: 0; }
    .info__text ::ng-deep p + p { margin-top: 0.5rem; }
  `,
})
export class InfoBox {}
