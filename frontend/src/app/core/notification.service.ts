import { Injectable, computed, signal } from '@angular/core';

import { Invitation, InvitationStatus } from './models';

function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

function nextWeekday(offset: number): number {
  // Skip weekends so demo invitations always land on a working day.
  let o = offset;
  const d = new Date();
  d.setDate(d.getDate() + o);
  while (d.getDay() === 0 || d.getDay() === 6) { d.setDate(d.getDate() + 1); o++; }
  return o;
}

// Mock only: invitations addressed to the logged-in user.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _invitations = signal<Invitation[]>([
    { id: 1, fromName: 'Sabine Kern', title: 'Kundengespräch Müller GmbH', roomId: 1, start: at(nextWeekday(2), 13, 0), end: at(nextWeekday(2), 15, 30), createdAt: at(0, 8, 41), status: 'open' },
    { id: 2, fromName: 'Anke Lorenz', title: 'Strategie-Workshop', roomId: 3, start: at(nextWeekday(7), 9, 0), end: at(nextWeekday(7), 16, 0), createdAt: at(-1, 16, 12), status: 'open' },
    { id: 3, fromName: 'Tom Reuter', title: 'Onboarding neue Mitarbeitende', roomId: 3, start: at(nextWeekday(0), 10, 0), end: at(nextWeekday(0), 12, 0), createdAt: at(-4, 11, 5), status: 'accepted' },
  ]);

  readonly invitations = this._invitations.asReadonly();
  readonly open = computed(() => this._invitations().filter((i) => i.status === 'open'));
  readonly unreadCount = computed(() => this.open().length);
  readonly accepted = computed(() => this._invitations().filter((i) => i.status === 'accepted'));

  respond(id: number, status: InvitationStatus): void {
    this._invitations.update((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
  }
}
