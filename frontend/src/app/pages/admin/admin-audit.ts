import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AUDIT_ACTION_LABELS, AuditAction } from '../../core/models';

const ACTION_META: Record<AuditAction, { icon: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' }> = {
  login: { icon: 'pi pi-sign-in', severity: 'secondary' },
  logout: { icon: 'pi pi-sign-out', severity: 'secondary' },
  booking_created: { icon: 'pi pi-calendar-plus', severity: 'success' },
  booking_changed: { icon: 'pi pi-pencil', severity: 'info' },
  booking_cancelled: { icon: 'pi pi-calendar-times', severity: 'danger' },
  user_created: { icon: 'pi pi-user-plus', severity: 'success' },
  user_changed: { icon: 'pi pi-user-edit', severity: 'info' },
  role_changed: { icon: 'pi pi-shield', severity: 'warn' },
  user_locked: { icon: 'pi pi-lock', severity: 'danger' },
  room_created: { icon: 'pi pi-building', severity: 'success' },
  room_changed: { icon: 'pi pi-building', severity: 'info' },
  room_deleted: { icon: 'pi pi-trash', severity: 'danger' },
};

@Component({
  selector: 'app-admin-audit',
  imports: [DatePipe, FormsModule, ButtonModule, DatePickerModule, IconFieldModule, InputIconModule, InputTextModule, MultiSelectModule, TableModule, TagModule],
  templateUrl: './admin-audit.html',
  styleUrl: './admin-audit.scss',
})
export class AdminAudit {
  private readonly admin = inject(AdminDataService);

  readonly label = (a: AuditAction) => AUDIT_ACTION_LABELS[a];
  readonly icon = (a: AuditAction) => ACTION_META[a].icon;
  readonly severity = (a: AuditAction) => ACTION_META[a].severity;
  readonly actionOptions = (Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((value) => ({ value, label: AUDIT_ACTION_LABELS[value] }));

  readonly actions = signal<AuditAction[]>([]);
  readonly query = signal('');
  readonly range = signal<(Date | null)[] | null>(null);

  readonly entries = computed(() => {
    const actions = this.actions();
    const q = this.query().trim().toLowerCase();
    const [from, to] = this.range() ?? [];
    const toEnd = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59) : null;
    return this.admin
      .audit()
      .filter((e) => actions.length === 0 || actions.includes(e.action))
      .filter((e) => !q || `${e.userName} ${e.details}`.toLowerCase().includes(q))
      .filter((e) => !from || e.at >= from)
      .filter((e) => !toEnd || e.at <= toEnd)
      .sort((a, b) => b.at.getTime() - a.at.getTime());
  });

  readonly total = computed(() => this.admin.audit().length);
  readonly filtered = computed(() => this.actions().length > 0 || this.query().trim() !== '' || !!this.range()?.[0]);

  isOnly(action: AuditAction): boolean {
    const a = this.actions();
    return a.length === 1 && a[0] === action;
  }

  quick(action: AuditAction): void {
    this.actions.set([action]);
  }

  clear(): void {
    this.actions.set([]);
    this.query.set('');
    this.range.set(null);
  }
}
