import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { RadioButtonModule } from '@openng/optimus-ui/radiobutton';
import { SelectModule } from '@openng/optimus-ui/select';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { AdminUser, ROLE_LABELS, Role } from '../../core/models';

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  role: Role;
}

@Component({
  selector: 'app-admin-user-new',
  imports: [FormsModule, RouterLink, ButtonModule, DialogModule, InputTextModule, MessageModule, RadioButtonModule, SelectModule],
  templateUrl: './admin-user-new.html',
  styleUrl: './admin-user-new.scss',
})
export class AdminUserNew {
  private readonly admin = inject(AdminDataService);
  private readonly auth = inject(AuthService);

  readonly roleLabels = ROLE_LABELS;
  readonly departments = this.admin.departments;

  readonly draft = signal<Draft>({ firstName: '', lastName: '', email: '', department: null, role: 'nutzer' });
  readonly reviewOpen = signal(false);
  readonly created = signal<AdminUser | null>(null);

  readonly invalid = computed(() => {
    const d = this.draft();
    return !d.firstName.trim() || !d.lastName.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email) || !d.department;
  });

  patch(p: Partial<Draft>): void {
    this.draft.update((d) => ({ ...d, ...p }));
  }

  suggestEmail(): void {
    const d = this.draft();
    if (d.email || !d.firstName || !d.lastName) return;
    const slug = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');
    this.patch({ email: `${slug(d.firstName)}.${slug(d.lastName)}@firma.de` });
  }

  confirm(): void {
    const d = this.draft();
    const user = this.admin.createUser(
      { firstName: d.firstName.trim(), lastName: d.lastName.trim(), email: d.email.trim(), department: d.department!, role: d.role },
      this.auth.user().name,
    );
    this.reviewOpen.set(false);
    this.created.set(user);
    queueMicrotask(() => document.getElementById('benutzer-angelegt')?.focus());
  }

  reset(): void {
    this.draft.set({ firstName: '', lastName: '', email: '', department: null, role: 'nutzer' });
    this.created.set(null);
  }
}
