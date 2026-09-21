import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'raumbuchung.theme';
const DARK_CLASS = 'app-dark';
const TRANSITION_CLASS = 'theme-transition';
const TRANSITION_MS = 350;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private transitionTimer: ReturnType<typeof setTimeout> | undefined;

  readonly dark = signal(this.readStored());

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.classList.toggle(DARK_CLASS, this.dark());
      root.style.colorScheme = this.dark() ? 'dark' : 'light';
    });
  }

  toggle(): void {
    const root = this.document.documentElement;
    // Enable the cross-fade only while switching so normal interactions stay snappy.
    root.classList.add(TRANSITION_CLASS);
    clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS);

    this.dark.update((v) => !v);
    try {
      localStorage.setItem(STORAGE_KEY, this.dark() ? 'dark' : 'light');
    } catch {
      // Storage may be unavailable (private mode); the choice then lasts for the session only.
    }
  }

  private readStored(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  }
}
