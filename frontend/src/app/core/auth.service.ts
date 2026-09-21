import { Injectable, computed, signal } from '@angular/core';

import { User } from './models';

// Mock only: the real implementation will read the session from the backend.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User>({
    id: 1,
    name: 'Felix Brandt',
    role: 'Administrator, IT-Abteilung',
    isAdmin: true,
    avatarUrl: null,
  });

  readonly user = this._user.asReadonly();
  readonly isAdmin = computed(() => this._user().isAdmin);
  readonly initials = computed(() =>
    this._user()
      .name.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  setAdmin(isAdmin: boolean): void {
    this._user.update((u) => ({ ...u, isAdmin, role: isAdmin ? 'Administrator, IT-Abteilung' : 'Auszubildender, IT-Abteilung' }));
  }
}
