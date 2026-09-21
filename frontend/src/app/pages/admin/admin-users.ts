import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { ROLE_LABELS, Role } from '../../core/models';

@Component({
  selector: 'app-admin-users',
  imports: [DatePipe, FormsModule, RouterLink, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, MessageModule, SelectModule, TableModule, TagModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  private readonly admin = inject(AdminDataService);

  readonly roleLabel = (r: Role) => ROLE_LABELS[r];
  readonly query = signal('');
  readonly roleFilter = signal<Role | null>(null);
  readonly roleOptions = [
    { label: 'Alle Rollen', value: null },
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
}
