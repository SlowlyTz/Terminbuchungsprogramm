import { Injectable, signal } from '@angular/core';

/** How long the prototype pretends to load its initial data. */
export const BOOT_MS = 1000;

/**
 * Mock only: stands in for the first data request after signing in, so the
 * skeleton and the error state are visible without a backend.
 */
@Injectable({ providedIn: 'root' })
export class BootService {
  private readonly _ready = signal(false);
  private readonly _failed = signal(false);

  readonly ready = this._ready.asReadonly();
  readonly failed = this._failed.asReadonly();

  /** Prototype switch (Settings): makes the next load fail on purpose. */
  readonly simulateError = signal(false);

  /** Starts the fake initial load; called whenever the shell is mounted. */
  start(): void {
    this._ready.set(false);
    this._failed.set(false);
    setTimeout(() => {
      if (this.simulateError()) this._failed.set(true);
      else this._ready.set(true);
    }, BOOT_MS);
  }

  /** Retry from the error screen: clears the switch so the load succeeds. */
  retry(): void {
    this.simulateError.set(false);
    this.start();
  }

  /** Back to the pre-login state, so the next sign-in shows the skeleton again. */
  reset(): void {
    this._ready.set(false);
    this._failed.set(false);
  }
}
