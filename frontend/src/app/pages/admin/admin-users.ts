import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { AdminUser, ROLE_LABELS, Role } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { EmptyState } from '../../shared/empty-state/empty-state';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface UserDraft {
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  role: Role;
}

@Component({
  selector: 'app-admin-users',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TableModule,
    TagModule,
    EmptyState,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  private readonly admin = inject(AdminDataService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(Notify);

  readonly roleLabel = (r: Role) => ROLE_LABELS[r];
  readonly departments = this.admin.departments;
  readonly query = signal('');
  readonly roleFilter = signal<Role | null>(null);
  readonly roleOptions = [
    { label: 'Alle Rollen', value: null },
    { label: 'Nutzer', value: 'nutzer' },
    { label: 'Admin', value: 'admin' },
  ];
  readonly roleChoices = [
    { label: 'Nutzer', value: 'nutzer' },
    { label: 'Admin', value: 'admin' },
  ];

  readonly users = computed(() => {
    const q = this.query().trim().toLowerCase();
    const role = this.roleFilter();
    return this.admin
      .users()
      .filter((u) => !role || u.role === role)
      .filter((u) => !q || `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase().includes(q))
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'de'));
  });

  readonly total = computed(() => this.admin.users().length);
  readonly adminCount = computed(() => this.admin.users().filter((u) => u.role === 'admin').length);
  readonly filterActive = computed(() => this.query().trim() !== '' || this.roleFilter() !== null);

  // --- Edit dialog ---------------------------------------------------------
  readonly editing = signal<AdminUser | null>(null);
  readonly draft = signal<UserDraft | null>(null);
  readonly submitted = signal(false);

  readonly invalid = computed(() => {
    const d = this.draft();
    if (!d) return true;
    return !d.firstName.trim() || !d.lastName.trim() || !EMAIL_PATTERN.test(d.email.trim()) || !d.department;
  });

  /** Taking away your own admin rights locks you out of this page. */
  readonly losingOwnAdmin = computed(() => {
    const u = this.editing();
    const d = this.draft();
    return !!u && !!d && u.id === this.auth.user().id && u.role === 'admin' && d.role === 'nutzer';
  });

  readonly toToggle = signal<AdminUser | null>(null);

  clearFilters(): void {
    this.query.set('');
    this.roleFilter.set(null);
  }

  edit(u: AdminUser): void {
    this.editing.set(u);
    this.draft.set({ firstName: u.firstName, lastName: u.lastName, email: u.email, department: u.department, role: u.role });
    this.submitted.set(false);
  }

  patch(p: Partial<UserDraft>): void {
    this.draft.update((d) => (d ? { ...d, ...p } : d));
  }

  save(): void {
    this.submitted.set(true);
    const u = this.editing();
    const d = this.draft();
    if (!u || !d || this.invalid()) return;

    const actor = this.auth.user().name;
    this.admin.updateUser(
      u.id,
      { firstName: d.firstName.trim(), lastName: d.lastName.trim(), email: d.email.trim(), department: d.department! },
      actor,
    );
    if (d.role !== u.role) {
      this.admin.setRole(u.id, d.role, actor);
      if (u.id === this.auth.user().id) this.auth.setAdmin(d.role === 'admin');
    }

    this.notify.success(`${d.firstName} ${d.lastName} wurde aktualisiert.`, 'Benutzer gespeichert');
    this.editing.set(null);
    this.draft.set(null);
  }

  confirmToggle(): void {
    const u = this.toToggle();
    if (!u) return;
    this.admin.setActive(u.id, !u.active, this.auth.user().name);
    this.notify.success(
      u.active ? `${u.firstName} ${u.lastName} kann sich nicht mehr anmelden.` : `${u.firstName} ${u.lastName} kann sich wieder anmelden.`,
      u.active ? 'Konto gesperrt' : 'Konto entsperrt',
    );
    this.toToggle.set(null);
  }
}
