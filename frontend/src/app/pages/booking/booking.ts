import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { SelectModule } from '@openng/optimus-ui/select';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService, combine } from '../../core/data.service';
import { Booking as BookingModel, BookingDraft, Invitee, Room } from '../../core/models';
import { WeekCalendar } from '../../shared/week-calendar/week-calendar';

const MOBILE_QUERY = '(max-width: 767px)';

@Component({
  selector: 'app-booking',
  imports: [DatePipe, FormsModule, RouterLink, AutoCompleteModule, ButtonModule, DialogModule, InputTextModule, MessageModule, SelectModule, TagModule, WeekCalendar],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Query params bound by the router: ?raum=<id>&vorlage=<bookingId>
  readonly raum = input<string>();
  readonly vorlage = input<string>();

  readonly rooms = this.data.rooms;
  readonly user = this.auth.user;

  readonly room = signal<Room | null>(null);
  readonly weekStart = signal(startOfWeek(new Date()));
  readonly dayIndex = signal(weekdayIndex(new Date()));
  readonly isMobile = signal(false);

  readonly draft = signal<BookingDraft | null>(null);
  /** Dialog step: form first, then the summary to confirm. */
  readonly step = signal<'form' | 'review'>('form');
  readonly dialogOpen = computed(() => this.draft() !== null);
  readonly suggestions = signal<Invitee[]>([]);
  readonly conflict = signal<BookingModel | null>(null);
  readonly confirmed = signal<BookingModel | null>(null);

  readonly weekDays = computed(() => Array.from({ length: 5 }, (_, i) => addDays(this.weekStart(), i)));
  readonly visibleDays = computed(() => (this.isMobile() ? [this.weekDays()[this.dayIndex()]] : this.weekDays()));
  readonly roomBookings = computed(() => {
    const r = this.room();
    // Read bookings() so the calendar refreshes after a new booking is created.
    return r ? this.data.bookings().filter((b) => b.roomId === r.id) : [];
  });
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';
  readonly inviteeNames = (b: BookingModel) => b.invitees.map((i) => i.name).join(', ');

  readonly draftStart = computed(() => {
    const d = this.draft();
    return d ? combine(d.date, d.startTime) : null;
  });
  readonly draftEnd = computed(() => {
    const d = this.draft();
    return d ? combine(d.date, d.endTime) : null;
  });
  readonly draftInvalid = computed(() => {
    const s = this.draftStart();
    const e = this.draftEnd();
    return !s || !e || e <= s;
  });

  constructor() {
    const mq = window.matchMedia(MOBILE_QUERY);
    this.isMobile.set(mq.matches);
    const listener = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    mq.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => mq.removeEventListener('change', listener));

    effect(() => {
      const id = Number(this.raum());
      const preset = this.rooms().find((r) => r.id === id) ?? null;
      if (preset) this.room.set(preset);

      const template = this.data.bookings().find((b) => b.id === Number(this.vorlage()));
      if (preset && template) {
        this.draft.set({
          roomId: preset.id,
          date: nextWeekday(new Date()),
          startTime: toTime(template.start),
          endTime: toTime(template.end),
          title: template.title,
          invitees: [...template.invitees],
        });
        this.step.set('form');
      }
    });
  }

  onRoomChange(room: Room | null): void {
    this.room.set(room);
    this.draft.set(null);
    this.confirmed.set(null);
    this.conflict.set(null);
  }

  previousWeek(): void { this.weekStart.update((d) => addDays(d, -7)); }
  nextWeek(): void { this.weekStart.update((d) => addDays(d, 7)); }
  today(): void {
    this.weekStart.set(startOfWeek(new Date()));
    this.dayIndex.set(weekdayIndex(new Date()));
  }
  previousDay(): void {
    if (this.dayIndex() > 0) this.dayIndex.update((i) => i - 1);
    else { this.previousWeek(); this.dayIndex.set(4); }
  }
  nextDay(): void {
    if (this.dayIndex() < 4) this.dayIndex.update((i) => i + 1);
    else { this.nextWeek(); this.dayIndex.set(0); }
  }

  startDraft(slotStart: Date): void {
    const r = this.room();
    if (!r) return;
    const end = new Date(slotStart.getTime() + 60 * 60_000);
    this.confirmed.set(null);
    this.conflict.set(null);
    this.step.set('form');
    this.draft.set({ roomId: r.id, date: slotStart, startTime: toTime(slotStart), endTime: toTime(end), title: '', invitees: [] });
  }

  searchInvitees(event: AutoCompleteCompleteEvent): void {
    const q = event.query.trim().toLowerCase();
    const chosen = new Set(this.draft()?.invitees.map((i) => i.id) ?? []);
    this.suggestions.set(
      this.admin
        .users()
        .filter((u) => u.active && u.id !== this.user().id && !chosen.has(u.id))
        .map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, department: u.department }))
        .filter((i) => !q || `${i.name} ${i.department}`.toLowerCase().includes(q))
        .slice(0, 8),
    );
  }

  patchDraft(patch: Partial<BookingDraft>): void {
    this.draft.update((d) => (d ? { ...d, ...patch } : d));
    this.conflict.set(null);
  }

  review(): void {
    const d = this.draft();
    const s = this.draftStart();
    const e = this.draftEnd();
    if (!d || !s || !e || this.draftInvalid()) return;
    const conflict = this.data.findConflict(d.roomId, s, e);
    if (conflict) {
      this.conflict.set(conflict);
      return;
    }
    this.step.set('review');
  }

  confirm(): void {
    const d = this.draft();
    if (!d) return;
    const booking = this.data.create(d, this.user().id, this.user().name);
    this.draft.set(null);
    this.confirmed.set(booking);
    queueMicrotask(() => document.getElementById('buchung-bestaetigt')?.focus());
  }

  cancelDraft(): void {
    this.draft.set(null);
    this.conflict.set(null);
  }
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function weekdayIndex(d: Date): number {
  const day = d.getDay();
  return day === 0 || day === 6 ? 0 : day - 1;
}

function nextWeekday(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  while (r.getDay() === 0 || r.getDay() === 6) r.setDate(r.getDate() + 1);
  return r;
}

function toTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
