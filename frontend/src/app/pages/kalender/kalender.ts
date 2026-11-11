import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { SelectModule } from '@openng/optimus-ui/select';
import { TagModule } from '@openng/optimus-ui/tag';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { DataService, combine } from '../../core/data.service';
import { Booking, BookingDraft, Invitee, Room } from '../../core/models';
import { Notify } from '../../core/notify.service';
import { seatLimit, seatLimitWarning } from '../../core/seats';
import { BookingDetail } from '../../shared/booking-detail/booking-detail';
import { Collapsible } from '../../shared/collapsible/collapsible';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { WeekCalendar } from '../../shared/week-calendar/week-calendar';

const MOBILE_QUERY = '(max-width: 767px)';
const STORAGE_KEY = 'raumbuchung.kalender';
const HIGHLIGHT_MS = 2000;
/** Bookable hours, same range as the calendar grid. */
const DAY_START = 7;
const DAY_END = 19;

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
    AutoCompleteModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    SelectModule,
    TagModule,
    ToggleSwitchModule,
    BookingDetail,
    Collapsible,
    EmptyState,
    WeekCalendar,
  ],
  templateUrl: './kalender.html',
  styleUrl: './kalender.scss',
  host: { '(document:keydown)': 'onShortcut($event)' },
})
export class Kalender {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  private readonly admin = inject(AdminDataService);
  private readonly notify = inject(Notify);
  private readonly destroyRef = inject(DestroyRef);
  /** Room and filters from the last visit; `?raum=` still wins. */
  private readonly stored = storedSelection();

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
  readonly equipmentFilter = signal<string[]>(this.stored.equipment);
  readonly floorFilter = signal<string[]>(this.stored.floors);
  readonly minCapacity = signal(this.stored.minCapacity);

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
  readonly dialogOpen = computed(() => this.draft() !== null);
  readonly suggestions = signal<Invitee[]>([]);
  readonly conflict = signal<Booking | null>(null);
  /** Freshly created booking, briefly highlighted in the calendar. */
  readonly highlightId = signal<number | null>(null);
  private highlightTimer?: ReturnType<typeof setTimeout>;

  // The time pickers work with Date, the draft with "HH:mm". Keeping the picker's own Date while
  // the time is unchanged stops ngModel from rewriting the field while someone is typing.
  readonly startPick = linkedSignal<string | undefined, Date | null>({
    source: () => this.draft()?.startTime,
    computation: (time, prev) => pickFor(time, prev?.value),
  });
  readonly endPick = linkedSignal<string | undefined, Date | null>({
    source: () => this.draft()?.endTime,
    computation: (time, prev) => pickFor(time, prev?.value),
  });

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

  readonly draftStart = computed(() => {
    const d = this.draft();
    return d?.startTime ? combine(d.date, d.startTime) : null;
  });
  readonly draftEnd = computed(() => {
    const d = this.draft();
    return d?.endTime ? combine(d.date, d.endTime) : null;
  });
  readonly draftInvalid = computed(() => {
    const s = this.draftStart();
    const e = this.draftEnd();
    return !s || !e || e <= s;
  });

  // --- Seats -----------------------------------------------------------------
  /** "Weitere Angaben" section; opened when the seat limit is hit so the video switch is in view. */
  readonly moreOpen = signal(false);
  readonly seatCapacity = computed(() => {
    const d = this.draft();
    return d ? (this.data.roomById().get(d.roomId)?.capacity ?? 0) : 0;
  });
  /** Organiser plus the people invited to the room; online participants take no seat. */
  readonly seatsTaken = computed(() => (this.draft()?.invitees.length ?? 0) + 1);
  readonly roomFull = computed(() => this.seatsTaken() >= this.seatCapacity());
  /** Switching the video conference off would drop the online participants, so it waits until they are removed. */
  readonly onlineLocked = computed(() => {
    const d = this.draft();
    return !!d && d.online && d.onlineInvitees.length > 0;
  });

  constructor() {
    const mq = window.matchMedia(MOBILE_QUERY);
    this.isMobile.set(mq.matches);
    const listener = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    mq.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => mq.removeEventListener('change', listener));

    this.destroyRef.onDestroy(() => clearTimeout(this.highlightTimer));

    this.room.set(this.data.rooms().find((r) => r.id === this.stored.roomId) ?? null);

    // Only the query params trigger this; new bookings must not reopen the template.
    effect(() => {
      const id = Number(this.raum());
      const templateId = Number(this.vorlage());
      untracked(() => {
        const preset = this.data.rooms().find((r) => r.id === id) ?? null;
        if (!preset) return;
        if (!this.rooms().some((r) => r.id === preset.id)) this.clearFilters();
        this.room.set(preset);

        const template = this.data.bookings().find((b) => b.id === templateId);
        if (!template) return;
        const date = nextWeekday(new Date());
        this.showDay(date);
        this.openDraft({
          roomId: preset.id,
          date,
          startTime: toTime(template.start),
          endTime: toTime(template.end),
          title: template.title,
          invitees: [...template.invitees],
          online: template.online,
          onlineInvitees: [...template.onlineInvitees],
        });
      });
    });

    // Keep the selection honest: there is always a room while any passes the filters.
    effect(() => {
      const list = this.rooms();
      const current = this.room();
      if (current ? list.some((r) => r.id === current.id) : list.length === 0) return;
      const next = list[0] ?? null;
      this.room.set(next);
      if (current) {
        this.notify.info(
          next
            ? `Raum ${current.name} passt nicht zu den Filtern, jetzt Raum ${next.name}.`
            : `Raum ${current.name} passt nicht zu den Filtern.`,
          next ? 'Raum gewechselt' : 'Raum abgewählt',
        );
      }
    });

    effect(() =>
      rememberSelection({
        roomId: this.room()?.id ?? null,
        equipment: this.equipmentFilter(),
        floors: this.floorFilter(),
        minCapacity: this.minCapacity(),
      }),
    );
  }

  onRoomChange(room: Room | null): void {
    this.room.set(room);
    this.draft.set(null);
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

  /** Shows the week (or, on mobile, the day) containing `d`. */
  private showDay(d: Date): void {
    this.weekStart.set(startOfWeek(d));
    this.dayIndex.set(weekdayIndex(d));
  }

  startDraft(range: { start: Date; end: Date }): void {
    const r = this.room();
    if (!r) return;
    this.openDraft({
      roomId: r.id,
      date: range.start,
      startTime: toTime(range.start),
      endTime: toTime(range.end),
      title: '',
      invitees: [],
      online: false,
      onlineInvitees: [],
    });
  }

  private openDraft(draft: BookingDraft): void {
    this.conflict.set(null);
    this.moreOpen.set(draft.online);
    this.draft.set(draft);
  }

  /** Keyboard shortcut N: the next free hour from now in the shown week. */
  newAtNextFreeSlot(): void {
    const r = this.room();
    if (!r) return;
    const slot = nextFreeSlot(this.weekStart(), (s, e) => !!this.data.findConflict(r.id, s, e));
    if (!slot) {
      this.notify.info(`Raum ${r.name} hat diese Woche keine freie Stunde mehr.`, 'Kein freier Termin');
      return;
    }
    this.showDay(slot.start);
    this.startDraft(slot);
  }

  onShortcut(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (isEditable(e.target) || document.querySelector('.p-dialog') || !this.room()) return;
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
        if (this.isMobile()) this.previousDay();
        else this.previousWeek();
        break;
      case 'arrowright':
        if (this.isMobile()) this.nextDay();
        else this.nextWeek();
        break;
      case 't':
        this.today();
        break;
      case 'n':
        this.newAtNextFreeSlot();
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  setStart(value: Date | null): void {
    this.startPick.set(value);
    this.patchDraft({ startTime: value ? toTime(value) : '' });
  }

  setEnd(value: Date | null): void {
    this.endPick.set(value);
    this.patchDraft({ endTime: value ? toTime(value) : '' });
  }

  searchInvitees(event: AutoCompleteCompleteEvent): void {
    const q = event.query.trim().toLowerCase();
    // Nobody can be in the room and online at once, so both lists are excluded.
    const d = this.draft();
    const chosen = new Set([...(d?.invitees ?? []), ...(d?.onlineInvitees ?? [])].map((i) => i.id));
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

  /** Accepts the people for the room up to its seats; anything beyond is dropped with a warning. */
  setInvitees(list: Invitee[]): void {
    const d = this.draft();
    if (!d) return;
    const max = seatLimit(this.seatCapacity());
    if (list.length > max) {
      const { summary, detail } = seatLimitWarning(this.seatCapacity(), d.online);
      this.notify.warn(detail, summary);
      this.moreOpen.set(true);
      // A fresh array makes the autocomplete drop the chip it already added.
      this.patchDraft({ invitees: list.slice(0, max) });
      return;
    }
    this.patchDraft({ invitees: list });
  }

  /** Online participants are not limited by the room. */
  setOnlineInvitees(list: Invitee[]): void {
    this.patchDraft({ onlineInvitees: list });
  }

  setOnline(online: boolean): void {
    if (!online && this.onlineLocked()) return;
    this.patchDraft({ online });
  }

  book(): void {
    const d = this.draft();
    const s = this.draftStart();
    const e = this.draftEnd();
    if (!d || !s || !e || this.draftInvalid()) return;
    const conflict = this.data.findConflict(d.roomId, s, e);
    if (conflict) {
      this.conflict.set(conflict);
      return;
    }

    const booking = this.data.create(d, this.user().id, this.user().name);
    const room = this.roomName(booking.roomId);
    this.admin.log(this.user().name, 'booking_created', auditDetails(room, booking));
    this.draft.set(null);
    this.highlight(booking.id);
    this.notify.successWithUndo(
      `„${booking.title}“, Raum ${room}, ${shortDate(booking.start)}, ${toTime(booking.start)}–${toTime(booking.end)} Uhr · Bestätigung per E-Mail gesendet`,
      'Gebucht',
      () => this.undoBooking(booking),
    );
  }

  private undoBooking(b: Booking): void {
    if (!this.data.bookings().some((o) => o.id === b.id)) return;
    this.data.cancel(b.id);
    this.admin.log(this.user().name, 'booking_cancelled', auditDetails(this.roomName(b.roomId), b));
    this.notify.info(`„${b.title}“, Raum ${this.roomName(b.roomId)}.`, 'Buchung zurückgenommen');
  }

  private highlight(id: number): void {
    clearTimeout(this.highlightTimer);
    this.highlightId.set(id);
    this.highlightTimer = setTimeout(() => this.highlightId.set(null), HIGHLIGHT_MS);
  }

  cancelDraft(): void {
    this.draft.set(null);
    this.conflict.set(null);
  }
}

interface StoredSelection {
  roomId: number | null;
  equipment: string[];
  floors: string[];
  minCapacity: number;
}

function storedSelection(): StoredSelection {
  const fallback: StoredSelection = { roomId: null, equipment: [], floors: [], minCapacity: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return fallback;
    const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
    return {
      roomId: typeof raw.roomId === 'number' ? raw.roomId : null,
      equipment: strings(raw.equipment),
      floors: strings(raw.floors),
      minCapacity: typeof raw.minCapacity === 'number' ? raw.minCapacity : 0,
    };
  } catch {
    return fallback;
  }
}

function rememberSelection(selection: StoredSelection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Storage may be unavailable (private mode); the page then starts with the first room.
  }
}

/** Focus is in something that takes typing, so single-key shortcuts must stay out of the way. */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      !!target.closest('input, textarea, select, [role="combobox"], [role="listbox"]'))
  );
}

/**
 * First free hour on a half-hour boundary, from now (or the start of the shown week, if later)
 * up to the end of that week. A week in the past falls back to the current one.
 */
function nextFreeSlot(
  shownWeek: Date,
  taken: (start: Date, end: Date) => boolean,
): { start: Date; end: Date } | null {
  const now = new Date();
  const week = addDays(shownWeek, 5) <= now ? startOfWeek(now) : shownWeek;
  for (let i = 0; i < 5; i++) {
    const day = addDays(week, i);
    for (let m = DAY_START * 60; m + 60 <= DAY_END * 60; m += 30) {
      const start = new Date(day);
      start.setHours(0, m, 0, 0);
      const end = new Date(start.getTime() + 60 * 60_000);
      if (start >= now && !taken(start, end)) return { start, end };
    }
  }
  return null;
}

/** Keeps the previous picker value while it still shows the same time. */
function pickFor(time: string | undefined, prev: Date | null | undefined): Date | null {
  if (!time) return null;
  if (prev && toTime(prev) === time) return prev;
  return combine(new Date(), time);
}

function auditDetails(roomName: string, b: Booking): string {
  const day = b.start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return `Raum ${roomName}, ${day} ${toTime(b.start)}–${toTime(b.end)} Uhr`;
}

/** "Do 12.11." */
function shortDate(d: Date): string {
  const day = d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
  return `${day} ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
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
