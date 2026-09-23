import { Component, input, model } from '@angular/core';

let nextId = 0;

/** Expandable section with an animated body; the header is a real button for keyboard users. */
@Component({
  selector: 'app-collapsible',
  template: `
    <div class="collapsible" [class.is-open]="open()">
      <button
        type="button"
        class="collapsible__head"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="panelId"
        (click)="open.set(!open())"
      >
        <span class="collapsible__title">{{ title() }}</span>
        @if (hint()) {
          <span class="collapsible__hint">{{ hint() }}</span>
        }
        <i class="pi pi-chevron-down collapsible__chevron" aria-hidden="true"></i>
      </button>

      <!-- inert while closed, so tabbing never lands in hidden fields. -->
      <div class="collapsible__body" [id]="panelId" role="region" [attr.aria-label]="title()" [attr.inert]="open() ? null : ''">
        <div class="collapsible__clip">
          <div class="collapsible__content"><ng-content /></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .collapsible {
      border: 1px solid var(--p-content-border-color);
      border-radius: 0.5rem;
      background: var(--p-content-background);
      transition: border-color 0.2s ease;

      &.is-open { border-color: color-mix(in srgb, var(--p-primary-color) 40%, var(--p-content-border-color)); }
    }

    .collapsible__head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: 0;
      border-radius: 0.5rem;
      background: none;
      color: var(--p-text-color);
      font: inherit;
      font-weight: 600;
      text-align: left;
      cursor: pointer;

      &:hover { background: var(--p-content-hover-background); }
    }

    .collapsible__hint {
      font-weight: 400;
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
    }

    .collapsible__chevron {
      margin-left: auto;
      color: var(--p-text-muted-color);
      transition: transform 0.25s ease;
    }

    .is-open .collapsible__chevron { transform: rotate(180deg); }

    // Animating grid rows from 0fr to 1fr slides the body open without measuring its height.
    .collapsible__body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.25s ease;
    }

    .is-open .collapsible__body { grid-template-rows: 1fr; }

    .collapsible__clip {
      min-height: 0;
      overflow: hidden;
    }

    .collapsible__content {
      padding: 0.25rem 1rem 1rem;
      opacity: 0;
      transform: translateY(-0.25rem);
      transition: opacity 0.2s ease, transform 0.25s ease;
    }

    .is-open .collapsible__content { opacity: 1; transform: none; }

    // Fields inside do not need their trailing gap; the section's padding already provides it.
    .collapsible__content ::ng-deep > :last-child { margin-bottom: 0; }

    @media (prefers-reduced-motion: reduce) {
      .collapsible__body,
      .collapsible__chevron,
      .collapsible__content { transition: none; }
    }
  `,
})
export class Collapsible {
  readonly title = input.required<string>();
  /** Short muted text next to the title, e.g. "optional". */
  readonly hint = input<string>();
  readonly open = model(false);

  readonly panelId = `collapsible-${nextId++}`;
}
