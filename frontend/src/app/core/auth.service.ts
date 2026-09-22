import { Injectable, computed, inject, signal } from '@angular/core';

import { AdminDataService } from './admin-data.service';
import { AdminUser, User } from './models';

/** Mock only: every account in the user list signs in with this password. */
export const DEMO_PASSWORD = 'demo';

/** Failed attempts the mock tolerates before it locks the form. */
export const MAX_ATTEMPTS = 5;

/** From this attempt on the form warns that the account is about to be locked. */
export const WARN_AFTER_ATTEMPTS = 3;

export type LoginResult = 'ok' | 'wrong-credentials' | 'account-locked' | 'too-many-attempts';

const SIGNED_OUT: User = { id: 0, name: '', role: '', isAdmin: false, avatarUrl: null };

function describe(account: AdminUser): User {
  return {
    id: account.id,
    name: `${account.firstName} ${account.lastName}`,
    role: `${account.role === 'admin' ? 'Administrator' : 'Mitarbeitende:r'}, ${account.department}`,
    isAdmin: account.role === 'admin',
    avatarUrl: null,
  };
}

// Mock only: the real implementation will read the session from the backend.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly admin = inject(AdminDataService);

  private readonly _user = signal<User>(SIGNED_OUT);
  private readonly _signedIn = signal(false);
  private readonly _attempts = signal(0);

  readonly user = this._user.asReadonly();
  readonly signedIn = this._signedIn.asReadonly();
  readonly attempts = this._attempts.asReadonly();

  readonly lockedOut = computed(() => this._attempts() >= MAX_ATTEMPTS);
  readonly remainingAttempts = computed(() => Math.max(0, MAX_ATTEMPTS - this._attempts()));
  readonly isAdmin = computed(() => this._user().isAdmin);
  readonly initials = computed(() => {
    const name = this._user().name;
    if (!name) return '';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  /**
   * Signs the given account in. Whoever the address belongs to becomes the
   * current user, so the prototype can be shown from several perspectives.
   */
  login(email: string, password: string): LoginResult {
    if (this.lockedOut()) return 'too-many-attempts';

    const account = this.admin.users().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    // A disabled account is a dead end, not a wrong guess: it must not count as an attempt.
    if (account && !account.active && password === DEMO_PASSWORD) return 'account-locked';

    if (!account || password !== DEMO_PASSWORD) {
      this._attempts.update((n) => n + 1);
      return this.lockedOut() ? 'too-many-attempts' : 'wrong-credentials';
    }

    this._attempts.set(0);
    this._user.set(describe(account));
    this._signedIn.set(true);
    this.admin.log(this._user().name, 'login', 'Anmeldung über die Weboberfläche');
    return 'ok';
  }

  logout(): void {
    if (this._signedIn()) this.admin.log(this._user().name, 'logout', '');
    this._signedIn.set(false);
    this._user.set(SIGNED_OUT);
  }

  setAdmin(isAdmin: boolean): void {
    this._user.update((u) => ({ ...u, isAdmin, role: `${isAdmin ? 'Administrator' : 'Mitarbeitende:r'}, ${u.role.split(', ')[1] ?? 'IT'}` }));
  }
}
