import { Injectable, computed, signal } from '@angular/core';

import { Booking, BookingDraft, Invitee, Room } from './models';

const ROOMS: Room[] = [
  { id: 1, name: 'Kaiserslautern', capacity: 12, floor: 'EG', equipment: ['Beamer', 'Whiteboard'] },
  { id: 2, name: 'Mannheim', capacity: 6, floor: '1. OG', equipment: ['Bildschirm'] },
  { id: 3, name: 'Heidelberg', capacity: 20, floor: 'EG', equipment: ['Beamer', 'Videokonferenz', 'Whiteboard'] },
  { id: 4, name: 'Speyer', capacity: 4, floor: '2. OG', equipment: ['Bildschirm'] },
  { id: 5, name: 'Worms', capacity: 8, floor: '1. OG', equipment: ['Whiteboard'] },
  { id: 6, name: 'Ludwigshafen', capacity: 10, floor: '2. OG', equipment: ['Videokonferenz', 'Bildschirm'] },
];

function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

// Offsets are relative to the Monday of the current week so the demo always shows data.
function mondayOffset(): number {
  const day = new Date().getDay(); // 0 = Sunday
  return day === 0 ? -6 : 1 - day;
}

function seedBookings(): Booking[] {
  const m = mondayOffset();
  let id = 1;
  const b = (roomId: number, userId: number, userName: string, title: string, day: number, sh: number, sm: number, eh: number, em: number, invitees: Invitee[] = [], online = false, onlineInvitees: Invitee[] = []): Booking => ({
    id: id++, roomId, userId, userName, title, start: at(m + day, sh, sm), end: at(m + day, eh, em), invitees, online, onlineInvitees,
  });
  return [
    b(1, 2, 'Harald Weizmann', 'Monatsabschluss Buchhaltung', 1, 10, 0, 12, 0),
    b(1, 1, 'Felix Brandt', 'Daily IT', 0, 9, 0, 9, 30),
    b(1, 1, 'Felix Brandt', 'Daily IT', 1, 9, 0, 9, 30),
    b(1, 1, 'Felix Brandt', 'Daily IT', 2, 9, 0, 9, 30, [
      { id: 8, name: 'Jonas Pfeiffer', department: 'IT', status: 'accepted' },
      { id: 6, name: 'Murat Demir', department: 'Einkauf', status: 'declined' },
    ]),
    b(1, 1, 'Felix Brandt', 'Daily IT', 3, 9, 0, 9, 30),
    b(1, 1, 'Felix Brandt', 'Daily IT', 4, 9, 0, 9, 30),
    b(1, 3, 'Sabine Kern', 'Kundengespräch Müller GmbH', 2, 13, 0, 15, 30),
    b(1, 4, 'Tom Reuter', 'Schulung Zeiterfassung', 3, 10, 0, 12, 0),
    b(1, 3, 'Sabine Kern', 'Vertriebsrunde', 4, 14, 0, 16, 0),
    b(3, 5, 'Geschäftsleitung', 'Quartalsmeeting', 1, 14, 0, 17, 0, [
      { id: 1, name: 'Felix Brandt', department: 'IT', status: 'accepted' },
      { id: 3, name: 'Sabine Kern', department: 'Vertrieb', status: 'accepted' },
      { id: 7, name: 'Lena Hofmann', department: 'Marketing', status: 'open' },
    ]),
    b(3, 4, 'Tom Reuter', 'Onboarding neue Mitarbeitende', 0, 10, 0, 12, 0),
    b(2, 1, 'Felix Brandt', 'Code-Review Buchungsmodul', 2, 11, 0, 12, 0, [
      { id: 8, name: 'Jonas Pfeiffer', department: 'IT', status: 'accepted' },
    ], true, [
      { id: 4, name: 'Tom Reuter', department: 'Personal', status: 'open' },
    ]),
    b(2, 3, 'Sabine Kern', 'Telefonkonferenz', 0, 15, 0, 16, 0),
    b(5, 2, 'Harald Weizmann', 'Abstimmung Jahresabschluss', 3, 8, 30, 10, 0),
    b(6, 4, 'Tom Reuter', 'Video-Call Standort Berlin', 1, 11, 0, 12, 30, [], true, [
      { id: 3, name: 'Sabine Kern', department: 'Vertrieb', status: 'accepted' },
      { id: 10, name: 'Daniel Voss', department: 'Vertrieb', status: 'open' },
    ]),
    b(1, 2, 'Harald Weizmann', 'Monatsabschluss Buchhaltung', 8, 9, 0, 11, 0),
    b(3, 5, 'Geschäftsleitung', 'Strategie-Workshop', 7, 9, 0, 16, 0),
  ];
}

// Mock only: the real implementation will call the REST API.
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _bookings = signal<Booking[]>(seedBookings());
  private readonly _rooms = signal<Room[]>(ROOMS);
  private nextId = 100;
  private nextRoomId = 100;

  readonly rooms = this._rooms.asReadonly();
  readonly bookings = this._bookings.asReadonly();

  readonly roomById = computed(() => new Map(this.rooms().map((r) => [r.id, r])));

  bookingsForRoom(roomId: number): Booking[] {
    return this._bookings().filter((b) => b.roomId === roomId);
  }

  bookingsForUser(userId: number): Booking[] {
    return this._bookings()
      .filter((b) => b.userId === userId)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  upcomingForUser(userId: number, limit = 3): Booking[] {
    const now = Date.now();
    return this.bookingsForUser(userId).filter((b) => b.end.getTime() >= now).slice(0, limit);
  }

  lastBookingOfUser(userId: number): Booking | undefined {
    return this.bookingsForUser(userId).at(-1);
  }

  /**
   * Returns the booking that overlaps the requested range, if any.
   * `ignoreId` skips one booking, so editing it does not collide with itself.
   */
  findConflict(roomId: number, start: Date, end: Date, ignoreId?: number): Booking | undefined {
    return this._bookings().find((b) => b.id !== ignoreId && b.roomId === roomId && b.start < end && b.end > start);
  }

  create(draft: BookingDraft, userId: number, userName: string): Booking {
    const start = combine(draft.date, draft.startTime);
    const end = combine(draft.date, draft.endTime);
    const booking: Booking = {
      id: this.nextId++,
      roomId: draft.roomId,
      userId,
      userName,
      title: draft.title.trim() || 'Besprechung',
      start,
      end,
      invitees: [...draft.invitees],
      online: draft.online,
      onlineInvitees: draft.online ? [...draft.onlineInvitees] : [],
    };
    this._bookings.update((list) => [...list, booking]);
    return booking;
  }

  update(id: number, changes: Pick<Booking, 'start' | 'end' | 'title' | 'invitees' | 'online' | 'onlineInvitees'>): Booking | undefined {
    let updated: Booking | undefined;
    this._bookings.update((list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        updated = { ...b, ...changes, title: changes.title.trim() || 'Besprechung' };
        return updated;
      }),
    );
    return updated;
  }

  cancel(id: number): void {
    this._bookings.update((list) => list.filter((b) => b.id !== id));
  }

  // --- Rooms ---------------------------------------------------------------

  /** Bookings in this room that have not ended yet; blocks deletion. */
  futureBookings(roomId: number): Booking[] {
    const now = Date.now();
    return this._bookings().filter((b) => b.roomId === roomId && b.end.getTime() >= now);
  }

  createRoom(room: Omit<Room, 'id'>): Room {
    const created: Room = { ...room, id: this.nextRoomId++ };
    this._rooms.update((list) => [...list, created]);
    return created;
  }

  updateRoom(id: number, changes: Omit<Room, 'id'>): Room | undefined {
    let updated: Room | undefined;
    this._rooms.update((list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...changes };
        return updated;
      }),
    );
    return updated;
  }

  deleteRoom(id: number): void {
    this._rooms.update((list) => list.filter((r) => r.id !== id));
  }
}

export function combine(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}
