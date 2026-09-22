import { Injectable, signal } from '@angular/core';

import { AdminUser, AuditAction, AuditEntry, ROLE_LABELS, Role } from './models';

function ago(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const USERS: AdminUser[] = [
  { id: 1, firstName: 'Felix', lastName: 'Brandt', email: 'felix.brandt@firma.de', department: 'IT', role: 'admin', active: true, lastLogin: ago(0, 8, 12) },
  { id: 2, firstName: 'Harald', lastName: 'Weizmann', email: 'harald.weizmann@firma.de', department: 'Buchhaltung', role: 'nutzer', active: true, lastLogin: ago(3, 9, 40) },
  { id: 3, firstName: 'Sabine', lastName: 'Kern', email: 'sabine.kern@firma.de', department: 'Vertrieb', role: 'nutzer', active: true, lastLogin: ago(0, 7, 55) },
  { id: 4, firstName: 'Tom', lastName: 'Reuter', email: 'tom.reuter@firma.de', department: 'Personal', role: 'nutzer', active: true, lastLogin: ago(1, 13, 5) },
  { id: 5, firstName: 'Anke', lastName: 'Lorenz', email: 'anke.lorenz@firma.de', department: 'Geschäftsleitung', role: 'admin', active: true, lastLogin: ago(2, 16, 30) },
  { id: 6, firstName: 'Murat', lastName: 'Demir', email: 'murat.demir@firma.de', department: 'Einkauf', role: 'nutzer', active: true, lastLogin: ago(6, 11, 20) },
  { id: 7, firstName: 'Lena', lastName: 'Hofmann', email: 'lena.hofmann@firma.de', department: 'Marketing', role: 'nutzer', active: true, lastLogin: ago(0, 10, 2) },
  { id: 8, firstName: 'Jonas', lastName: 'Pfeiffer', email: 'jonas.pfeiffer@firma.de', department: 'IT', role: 'nutzer', active: false, lastLogin: ago(41, 8, 0) },
  { id: 9, firstName: 'Petra', lastName: 'Schulte', email: 'petra.schulte@firma.de', department: 'Empfang', role: 'nutzer', active: true, lastLogin: ago(0, 6, 58) },
  { id: 10, firstName: 'Daniel', lastName: 'Voss', email: 'daniel.voss@firma.de', department: 'Vertrieb', role: 'nutzer', active: true, lastLogin: null },
];

function seedAudit(): AuditEntry[] {
  let id = 1;
  const e = (days: number, hour: number, minute: number, userName: string, action: AuditAction, details: string): AuditEntry => ({
    id: id++, at: ago(days, hour, minute), userName, action, details,
  });
  return [
    e(0, 10, 4, 'Felix Brandt', 'booking_created', 'Raum Heidelberg, heute 14:00–15:00 Uhr'),
    e(0, 9, 58, 'Lena Hofmann', 'login', 'Browser Chrome, Firmennetz'),
    e(0, 9, 31, 'Sabine Kern', 'booking_cancelled', 'Raum Mannheim, heute 15:00–16:00 Uhr'),
    e(0, 8, 12, 'Felix Brandt', 'login', 'Browser Firefox, Firmennetz'),
    e(0, 7, 55, 'Sabine Kern', 'login', 'Browser Edge, Firmennetz'),
    e(0, 6, 58, 'Petra Schulte', 'login', 'Browser Edge, Firmennetz'),
    e(1, 17, 2, 'Tom Reuter', 'logout', ''),
    e(1, 14, 20, 'Tom Reuter', 'booking_changed', 'Raum Kaiserslautern, Do 10:00–12:00 Uhr → 10:00–12:30 Uhr'),
    e(1, 13, 5, 'Tom Reuter', 'login', 'Browser Chrome, Homeoffice (VPN)'),
    e(1, 11, 47, 'Anke Lorenz', 'role_changed', 'Felix Brandt: Nutzer → Admin'),
    e(1, 11, 45, 'Anke Lorenz', 'user_created', 'Daniel Voss (Vertrieb), Rolle Nutzer'),
    e(1, 9, 3, 'Harald Weizmann', 'booking_created', 'Raum Kaiserslautern, Di 10:00–12:00 Uhr'),
    e(2, 16, 30, 'Anke Lorenz', 'login', 'Browser Safari, Mobil'),
    e(2, 15, 12, 'Sabine Kern', 'booking_created', 'Raum Kaiserslautern, Fr 14:00–16:00 Uhr'),
    e(2, 12, 40, 'Murat Demir', 'booking_cancelled', 'Raum Worms, Mi 09:00–10:00 Uhr'),
    e(2, 9, 0, 'Lena Hofmann', 'booking_created', 'Raum Speyer, Mo 09:00–09:30 Uhr'),
    e(3, 9, 40, 'Harald Weizmann', 'login', 'Browser Edge, Firmennetz'),
    e(3, 9, 44, 'Harald Weizmann', 'booking_created', 'Raum Kaiserslautern, Mo 09:00–11:00 Uhr'),
    e(3, 9, 52, 'Harald Weizmann', 'logout', ''),
    e(4, 14, 15, 'Anke Lorenz', 'user_locked', 'Jonas Pfeiffer: Austritt zum Monatsende'),
    e(4, 11, 30, 'Felix Brandt', 'booking_created', 'Raum Mannheim, Mi 11:00–12:00 Uhr'),
    e(4, 8, 5, 'Tom Reuter', 'booking_created', 'Raum Heidelberg, Mo 10:00–12:00 Uhr'),
    e(5, 16, 48, 'Sabine Kern', 'booking_changed', 'Raum Kaiserslautern, Mi 13:00–15:00 Uhr → 13:00–15:30 Uhr'),
    e(5, 10, 22, 'Murat Demir', 'login', 'Browser Chrome, Firmennetz'),
    e(6, 11, 20, 'Murat Demir', 'booking_created', 'Raum Worms, Mi 09:00–10:00 Uhr'),
    e(6, 9, 15, 'Petra Schulte', 'booking_cancelled', 'Raum Ludwigshafen, Do 08:00–09:00 Uhr'),
    e(7, 13, 0, 'Anke Lorenz', 'user_created', 'Petra Schulte (Empfang), Rolle Nutzer'),
    e(7, 9, 30, 'Felix Brandt', 'booking_created', 'Raum Kaiserslautern, Mo–Fr 09:00–09:30 Uhr (Serie)'),
    e(8, 15, 45, 'Tom Reuter', 'booking_created', 'Raum Ludwigshafen, Di 11:00–12:30 Uhr'),
    e(8, 8, 50, 'Lena Hofmann', 'login', 'Browser Chrome, Firmennetz'),
    e(9, 17, 10, 'Anke Lorenz', 'logout', ''),
    e(9, 10, 5, 'Anke Lorenz', 'role_changed', 'Murat Demir: Admin → Nutzer'),
    e(10, 9, 12, 'Harald Weizmann', 'login', 'Browser Edge, Firmennetz'),
    e(11, 14, 33, 'Sabine Kern', 'booking_created', 'Raum Kaiserslautern, Mi 13:00–15:00 Uhr'),
    e(12, 8, 40, 'Felix Brandt', 'login', 'Browser Firefox, Firmennetz'),
    e(13, 16, 5, 'Tom Reuter', 'booking_cancelled', 'Raum Speyer, Fr 14:00–15:00 Uhr'),
    e(14, 10, 0, 'Anke Lorenz', 'user_created', 'Lena Hofmann (Marketing), Rolle Nutzer'),
  ];
}

// Mock only: the real implementation will call the REST API.
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly _users = signal<AdminUser[]>(USERS);
  private readonly _audit = signal<AuditEntry[]>(seedAudit());
  private nextUserId = 100;
  private nextAuditId = 1000;

  readonly users = this._users.asReadonly();
  readonly audit = this._audit.asReadonly();

  readonly departments = [...new Set(USERS.map((u) => u.department))].sort();

  createUser(user: Omit<AdminUser, 'id' | 'active' | 'lastLogin'>, actor: string): AdminUser {
    const created: AdminUser = { ...user, id: this.nextUserId++, active: true, lastLogin: null };
    this._users.update((list) => [...list, created]);
    this.log(actor, 'user_created', `${created.firstName} ${created.lastName} (${created.department}), Rolle ${user.role === 'admin' ? 'Admin' : 'Nutzer'}`);
    return created;
  }

  updateUser(id: number, changes: Pick<AdminUser, 'firstName' | 'lastName' | 'email' | 'department'>, actor: string): AdminUser | undefined {
    let updated: AdminUser | undefined;
    this._users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...changes };
        return updated;
      }),
    );
    if (updated) this.log(actor, 'user_changed', `Stammdaten geändert: ${updated.firstName} ${updated.lastName} (${updated.department})`);
    return updated;
  }

  setActive(id: number, active: boolean, actor: string): AdminUser | undefined {
    let updated: AdminUser | undefined;
    this._users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, active };
        return updated;
      }),
    );
    if (updated) {
      const name = `${updated.firstName} ${updated.lastName}`;
      this.log(actor, 'user_locked', active ? `${name}: Konto entsperrt` : `${name}: Konto gesperrt`);
    }
    return updated;
  }

  setRole(id: number, role: Role, actor: string): AdminUser | undefined {
    let previous: Role | undefined;
    let updated: AdminUser | undefined;
    this._users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        previous = u.role;
        updated = { ...u, role };
        return updated;
      }),
    );
    if (updated && previous && previous !== role) {
      this.log(
        actor,
        'role_changed',
        `${updated.firstName} ${updated.lastName}: ${ROLE_LABELS[previous]} → ${ROLE_LABELS[role]}`,
      );
    }
    return updated;
  }

  /** Appends an entry to the audit log; callers pass the acting user by name. */
  log(userName: string, action: AuditEntry['action'], details: string): void {
    this._audit.update((list) => [{ id: this.nextAuditId++, at: new Date(), userName, action, details }, ...list]);
  }
}
