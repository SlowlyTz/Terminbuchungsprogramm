import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { PasswordModule } from '@openng/optimus-ui/password';

import { DEMO_PASSWORD, LoginResult, MAX_ATTEMPTS, WARN_AFTER_ATTEMPTS, AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STORAGE_KEY = 'raumbuchung.email';

/** Mock only: a short pause so the pending state on the button is visible. */
const FAKE_REQUEST_MS = 800;

const ERROR_TEXT: Record<Exclude<LoginResult, 'ok'>, string> = {
  'wrong-credentials': 'E-Mail-Adresse oder Passwort ist falsch.',
  'account-locked': 'Konto gesperrt. Bitte an die IT-Abteilung wenden.',
  'too-many-attempts': `Konto nach ${MAX_ATTEMPTS} Fehlversuchen gesperrt. Bitte an die IT-Abteilung wenden.`,
};

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, ButtonModule, CheckboxModule, InputTextModule, MessageModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  /** Where to continue after signing in; set by the guard as ?weiter=<url>. */
  readonly weiter = input<string>();

  readonly demoPassword = DEMO_PASSWORD;

  readonly email = signal(storedEmail());
  readonly password = signal('');
  readonly remember = signal(storedEmail() !== '');
  readonly submitted = signal(false);
  readonly busy = signal(false);
  readonly error = signal<Exclude<LoginResult, 'ok'> | null>(null);

  readonly lockedOut = this.auth.lockedOut;
  readonly remainingAttempts = this.auth.remainingAttempts;

  readonly emailInvalid = computed(() => this.submitted() && !EMAIL_PATTERN.test(this.email().trim()));
  readonly emailMissing = computed(() => this.submitted() && this.email().trim() === '');
  readonly passwordMissing = computed(() => this.submitted() && this.password() === '');

  readonly errorText = computed(() => {
    const e = this.error();
    return e ? ERROR_TEXT[e] : null;
  });

  /** Warn before the account is locked, but only while it still can be saved. */
  readonly showAttemptWarning = computed(
    () => this.auth.attempts() >= WARN_AFTER_ATTEMPTS && !this.lockedOut() && this.error() !== null,
  );

  submit(): void {
    this.submitted.set(true);
    this.error.set(null);

    if (this.lockedOut()) {
      this.error.set('too-many-attempts');
      return;
    }
    if (this.emailInvalid() || this.passwordMissing()) return;

    this.busy.set(true);
    setTimeout(() => {
      const result = this.auth.login(this.email(), this.password());
      this.busy.set(false);

      if (result === 'ok') {
        rememberEmail(this.remember() ? this.email().trim() : '');
        this.router.navigateByUrl(this.weiter() || '/');
        return;
      }

      this.error.set(result);
      this.password.set('');
      // Send the caret back to the password field so a retry needs no mouse.
      queueMicrotask(() => document.getElementById('passwort')?.focus());
    }, FAKE_REQUEST_MS);
  }

  useDemoAccount(email: string): void {
    this.email.set(email);
    this.password.set(DEMO_PASSWORD);
    this.error.set(null);
    this.submitted.set(false);
  }
}

function storedEmail(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function rememberEmail(email: string): void {
  try {
    if (email) localStorage.setItem(STORAGE_KEY, email);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private mode); the address is then not prefilled next time.
  }
}
