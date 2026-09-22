import { Component, input, output } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';

/** Shared empty state: one icon, one sentence, one optional way out. */
@Component({
  selector: 'app-empty-state',
  imports: [ButtonModule],
  template: `
    <div class="empty" [class.empty--compact]="compact()">
      <span class="empty__icon" aria-hidden="true"><i [class]="icon()"></i></span>
      <p class="empty__title">{{ title() }}</p>
      @if (text()) {
        <p class="empty__text">{{ text() }}</p>
      }
      @if (actionLabel()) {
        <p-button [label]="actionLabel()!" [icon]="actionIcon()" [outlined]="true" (onClick)="action.emit()" />
      }
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--p-text-muted-color);
    }

    .empty--compact { padding: 1.75rem 1rem; }

    .empty__icon {
      display: grid;
      place-items: center;
      width: 3.5rem;
      height: 3.5rem;
      margin-bottom: 0.25rem;
      border-radius: 50%;
      background: var(--app-surface-muted);
      font-size: 1.5rem;
    }

    .empty__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--p-text-color);
    }

    .empty__text { margin: 0 0 0.5rem; max-width: 34rem; }
  `,
})
export class EmptyState {
  readonly icon = input('pi pi-inbox');
  readonly title = input.required<string>();
  readonly text = input<string>();
  readonly actionLabel = input<string>();
  readonly actionIcon = input<string>();
  readonly compact = input(false);

  readonly action = output<void>();
}
