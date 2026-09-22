import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';

import { ThemeService } from '../../core/theme.service';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FAKE_REQUEST_MS = 800;

@Component({
  selector: 'app-password-reset',
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordReset {
  readonly theme = inject(ThemeService);

  readonly email = signal('');
  readonly submitted = signal(false);
  readonly busy = signal(false);
  readonly sent = signal(false);

  readonly invalid = computed(() => this.submitted() && !EMAIL_PATTERN.test(this.email().trim()));
  readonly missing = computed(() => this.submitted() && this.email().trim() === '');

  submit(): void {
    this.submitted.set(true);
    if (this.invalid()) return;

    this.busy.set(true);
    // Mock only: no mail is sent; the delay just makes the pending state visible.
    setTimeout(() => {
      this.busy.set(false);
      this.sent.set(true);
      queueMicrotask(() => document.getElementById('reset-bestaetigt')?.focus());
    }, FAKE_REQUEST_MS);
  }

  again(): void {
    this.sent.set(false);
    this.submitted.set(false);
    this.email.set('');
  }
}
