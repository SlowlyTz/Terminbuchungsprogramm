import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { SelectModule } from '@openng/optimus-ui/select';
import { TagModule } from '@openng/optimus-ui/tag';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService, combine } from '../../core/data.service';
import { Booking, BookingDraft, Invitee, Room } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { BookingDetail } from '../../shared/booking-detail/booking-detail';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { InfoBox } from '../../shared/info-box/info-box';
import { WeekCalendar } from '../../shared/week-calendar/week-calendar';

const MOBILE_QUERY = '(max-width: 767px)';

/** Thresholds for the capacity filter; friendlier than a free number field. */
const CAPACITY_OPTIONS = [
  { label: 'Beliebig', value: 0 },
  { label: 'ab 4 Personen', value: 4 },
  { label: 'ab 6 Personen', value: 6 },
  { label: 'ab 8 Personen', value: 8 },
  { label: 'ab 12 Personen', value: 12 },
  { label: 'ab 20 Personen', value: 20 },
];

@Component({
  selector: 'app-kalender',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    AutoCompleteModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    SelectModule,
    TagModule,
    BookingDetail,
    EmptyState,
    InfoBox,
    WeekCalendar,
  ],
  templateUrl: './kalender.html',
  styleUrl: './kalender.scss',
})
export class Kalender {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly notify = inject(Notify);
  private readonly destroyRef = inject(DestroyRef);

  // Query params bound by the router: ?raum=<id>&vorlage=<bookingId>
  readonly raum = input<string>();
  readonly vorlage = input<string>();

  readonly user = this.auth.user;
  readonly capacityOptions = CAPACITY_OPTIONS;

  readonly room = signal<Room | null>(null);
  readonly weekStart = signal(startOfWeek(new Date()));
  readonly dayIndex = signal(weekdayIndex(new Date()));
  readonly isMobile = signal(false);

  // --- Filters -------------------------------------------------------------
  readonly equipmentFilter = signal<string[]>([]);
  readonly floorFilter = signal<string[]>([]);
  readonly minCapacity = signal(0);

  readonly equipmentOptions = computed(() => [...new Set(this.data.rooms().flatMap((r) => r.equipment))].sort());
  readonly floorOptions = computed(() => [...new Set(this.data.rooms().map((r) => r.floor))].sort());

  readonly rooms = computed(() => {
    const equipment = this.equipmentFilter();
    const floors = this.floorFilter();
    const min = this.minCapacity();
    return this.data
      .rooms()
      .filter((r) => r.capacity >= min)
      .filter((r) => floors.length === 0 || floors.includes(r.floor))
      .filter((r) => equipment.length === 0 || equipment.every((e) => r.equipment.includes(e)));
  });

  readonly totalRooms = computed(() => this.data.rooms().length);
  readonly filterActive = computed(() => this.equipmentFilter().length > 0 || this.floorFilter().length > 0 || this.minCapacity() > 0);

  // --- Booking dialog ------------------------------------------------------
  readonly draft = signal<BookingDraft | null>(null);
  /** Dialog step: form first, then the summary to confirm. */
  readonly step = signal<'form' | 'review'>('form');
  readonly dialogOpen = computed(() => this.draft() !== null);
  readonly suggestions = signal<Invitee[]>([]);
  readonly conflict = signal<Booking | null>(null);
  readonly confirmed = signal<Booking | null>(null);

  /** Booking shown in the read-only detail dialog. */
  readonly detail = signal<Booking | null>(null);

  readonly weekDays = computed(() => Array.from({ length: 5 }, (_, i) => addDays(this.weekStart(), i)));
  readonly visibleDays = computed(() => (this.isMobile() ? [this.weekDays()[this.dayIndex()]] : this.weekDays()));
  readonly roomBookings = computed(() => {
    const r = this.room();
    // Read bookings() so the calendar refreshes after a new booking is created.
    return r ? this.data.bookings().filter((b) => b.roomId === r.id) : [];
  });
  readonly roomName = (id: number) => this.data.roomById().get(id)?.name ?? '';
  readonly inviteeNames = (b: Booking) => b.invitees.map((i) => i.name).join(', ');

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
      const preset = this.data.rooms().find((r) => r.id === id) ?? null;
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

    // Keep the selection honest: a room that no longer passes the filters is cleared.
    effect(() => {
      const current = this.room();
      if (current && !this.rooms().some((r) => r.id === current.id)) {
        this.room.set(null);
        this.notify.info(`Raum ${current.name} passt nicht mehr zu den Filtern und wurde abgewählt.`);
      }
    });
  }

  onRoomChange(room: Room | null): void {
    this.room.set(room);
    this.draft.set(null);
    this.confirmed.set(null);
    this.conflict.set(null);
  }

  clearFilters(): void {
    this.equipmentFilter.set([]);
    this.floorFilter.set([]);
    this.minCapacity.set(0);
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
    this.admin.log(this.user().name, 'booking_created', auditDetails(this.roomName(booking.roomId), booking));
    this.draft.set(null);
    this.confirmed.set(booking);
    this.notify.success(`Raum ${this.roomName(booking.roomId)} ist für Sie reserviert.`, 'Buchung eingetragen');
    queueMicrotask(() => document.getElementById('buchung-bestaetigt')?.focus());
  }

  cancelDraft(): void {
    this.draft.set(null);
    this.conflict.set(null);
  }
}

function auditDetails(roomName: string, b: Booking): string {
  const day = b.start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return `Raum ${roomName}, ${day} ${toTime(b.start)}–${toTime(b.end)} Uhr`;
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
